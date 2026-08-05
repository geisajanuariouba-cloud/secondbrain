import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key — bypasses RLS so the
 * notifications cron can read every user's push subscription, not just
 * the row of whoever is logged in. Never import this from client code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
