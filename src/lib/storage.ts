/**
 * Storage abstraction: reads/writes from Supabase when logged in,
 * mirrors the same keys as localStorage so pages need minimal changes.
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function storageGet(key: string): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return localStorage.getItem(key);

  const { data, error } = await supabase
    .from("user_data")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  // value is stored as jsonb; wrap strings in quotes when saving, so unwrap here
  const v = data.value;
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

export async function storageSet(key: string, value: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) { localStorage.setItem(key, value); return; }

  // Parse value to store as jsonb (keeps numbers/arrays/objects native)
  let jsonValue: unknown;
  try { jsonValue = JSON.parse(value); } catch { jsonValue = value; }

  await supabase.from("user_data").upsert(
    { user_id: userId, key, value: jsonValue, updated_at: new Date().toISOString() },
    { onConflict: "user_id,key" }
  );
}

export async function storageRemove(key: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) { localStorage.removeItem(key); return; }
  await supabase.from("user_data").delete().eq("user_id", userId).eq("key", key);
}

/**
 * Migrate all localStorage keys to Supabase once after first login.
 * Call this once on login success.
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const migrated = localStorage.getItem("__sb_migrated__");
  if (migrated) return;

  const entries: { user_id: string; key: string; value: unknown; updated_at: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === "__sb_migrated__") continue;
    const raw = localStorage.getItem(key)!;
    let jsonValue: unknown;
    try { jsonValue = JSON.parse(raw); } catch { jsonValue = raw; }
    entries.push({ user_id: userId, key, value: jsonValue, updated_at: new Date().toISOString() });
  }

  if (entries.length > 0) {
    await supabase.from("user_data").upsert(entries, { onConflict: "user_id,key", ignoreDuplicates: true });
  }

  localStorage.setItem("__sb_migrated__", "1");
}
