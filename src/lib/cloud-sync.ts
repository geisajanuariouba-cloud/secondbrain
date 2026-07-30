"use client";

/**
 * App-wide cloud sync: hydrates localStorage from Supabase on load (so any
 * device/browser sees the same data after login), then transparently mirrors
 * every localStorage.setItem/removeItem to Supabase in the background.
 * Pages keep using localStorage directly — no per-page changes needed.
 */

import { createClient } from "@/lib/supabase/client";

const SKIP_KEYS = new Set(["__sb_migrated__", "__cloud_sync_done__"]);

function toStorageValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

/** Pulls every saved key for the logged-in user down into localStorage. */
export async function hydrateFromCloud(): Promise<string | null> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_data")
    .select("key, value")
    .eq("user_id", userId);

  if (!error && data) {
    for (const row of data) {
      localStorage.setItem(row.key, toStorageValue(row.value));
    }
  }
  return userId;
}

let patched = false;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

/** Patches localStorage so every write/remove also syncs to Supabase for the given user. */
export function enableCloudMirror(userId: string) {
  if (patched) return;
  patched = true;

  const supabase = createClient();
  const origSetItem = localStorage.setItem.bind(localStorage);
  const origRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = (key: string, value: string) => {
    origSetItem(key, value);
    if (SKIP_KEYS.has(key)) return;

    const existing = pending.get(key);
    if (existing) clearTimeout(existing);
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        let jsonValue: unknown;
        try { jsonValue = JSON.parse(value); } catch { jsonValue = value; }
        supabase
          .from("user_data")
          .upsert(
            { user_id: userId, key, value: jsonValue, updated_at: new Date().toISOString() },
            { onConflict: "user_id,key" }
          )
          .then(() => {});
      }, 400)
    );
  };

  localStorage.removeItem = (key: string) => {
    origRemoveItem(key);
    if (SKIP_KEYS.has(key)) return;
    supabase.from("user_data").delete().eq("user_id", userId).eq("key", key).then(() => {});
  };
}
