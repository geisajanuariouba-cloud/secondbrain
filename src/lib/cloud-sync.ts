"use client";

/**
 * App-wide cloud sync: hydrates localStorage from Supabase on load (so any
 * device/browser sees the same data after login), then transparently mirrors
 * every localStorage.setItem/removeItem to Supabase in the background.
 * Pages keep using localStorage directly — no per-page changes needed.
 *
 * Safety nets so no change is lost:
 *  - keys not yet confirmed by the server are tracked as "dirty" in localStorage
 *    and pushed (instead of overwritten) on the next load;
 *  - pending writes are flushed immediately when the tab is hidden/closed;
 *  - failed writes are retried.
 */

import { createClient } from "@/lib/supabase/client";

const SKIP_KEYS = new Set(["__sb_migrated_v2__", "__cloud_sync_done__", "__sync_dirty__"]);
const DIRTY_KEY = "__sync_dirty__";

function toStorageValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function parseValue(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return raw; }
}

// Uses the original (unpatched) setItem so bookkeeping never triggers a sync.
const rawSet = typeof window !== "undefined" ? Storage.prototype.setItem : null;

function readDirty(): Record<string, "set" | "remove"> {
  try { return JSON.parse(localStorage.getItem(DIRTY_KEY) ?? "{}"); } catch { return {}; }
}
function writeDirty(d: Record<string, "set" | "remove">) {
  rawSet?.call(localStorage, DIRTY_KEY, JSON.stringify(d));
}
function markDirty(key: string, op: "set" | "remove") {
  const d = readDirty(); d[key] = op; writeDirty(d);
}
function clearDirty(key: string) {
  const d = readDirty(); delete d[key]; writeDirty(d);
}

async function pushKey(userId: string, key: string, op: "set" | "remove"): Promise<boolean> {
  const supabase = createClient();
  try {
    if (op === "remove" || localStorage.getItem(key) === null) {
      const { error } = await supabase.from("user_data").delete().eq("user_id", userId).eq("key", key);
      if (error) return false;
    } else {
      const { error } = await supabase.from("user_data").upsert(
        { user_id: userId, key, value: parseValue(localStorage.getItem(key)!), updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" }
      );
      if (error) return false;
    }
    clearDirty(key);
    return true;
  } catch {
    return false;
  }
}

/** Pushes locally-changed-but-unsynced keys, then pulls everything else down. */
export async function hydrateFromCloud(): Promise<string | null> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;
  if (!userId) return null;

  const dirty = readDirty();
  for (const [key, op] of Object.entries(dirty)) {
    await pushKey(userId, key, op);
  }
  const stillDirty = readDirty();

  const { data, error } = await supabase.from("user_data").select("key, value").eq("user_id", userId);
  if (!error && data) {
    for (const row of data) {
      if (stillDirty[row.key]) continue; // keep the newer local version
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

  const origSetItem = localStorage.setItem.bind(localStorage);
  const origRemoveItem = localStorage.removeItem.bind(localStorage);

  const send = async (key: string, op: "set" | "remove", attempt = 0) => {
    const ok = await pushKey(userId, key, op);
    if (!ok && attempt < 3) setTimeout(() => send(key, op, attempt + 1), 2000 * (attempt + 1));
  };

  const schedule = (key: string, op: "set" | "remove") => {
    markDirty(key, op);
    const existing = pending.get(key);
    if (existing) clearTimeout(existing);
    pending.set(key, setTimeout(() => { pending.delete(key); send(key, op); }, 400));
  };

  localStorage.setItem = (key: string, value: string) => {
    origSetItem(key, value);
    if (!SKIP_KEYS.has(key)) schedule(key, "set");
  };

  localStorage.removeItem = (key: string) => {
    origRemoveItem(key);
    if (!SKIP_KEYS.has(key)) schedule(key, "remove");
  };

  // Flush everything pending the moment the page is hidden or closed.
  const flush = () => {
    for (const [key, timer] of pending) {
      clearTimeout(timer);
      pending.delete(key);
      send(key, readDirty()[key] ?? "set");
    }
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);

  // Retry anything left unsynced from earlier failures.
  for (const [key, op] of Object.entries(readDirty())) send(key, op);
}
