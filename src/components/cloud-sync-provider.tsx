"use client";

import { useEffect, useState } from "react";
import { hydrateFromCloud, enableCloudMirror } from "@/lib/cloud-sync";

/**
 * Wraps the app. Before rendering any page, pulls the logged-in user's saved
 * data down from Supabase into localStorage, then starts mirroring every
 * future localStorage write back up. Renders immediately if not logged in.
 */
export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateFromCloud()
      .then((userId) => {
        if (cancelled) return;
        if (userId) enableCloudMirror(userId);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
