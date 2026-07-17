import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for server-only telemetry writes and pre-auth reads.
 *
 * Auth telemetry (esp. failed logins and the brute-force counter) happens BEFORE a
 * user session exists, so `auth.uid()` is null and RLS can't apply. The service-role
 * client runs on the server only and bypasses RLS, which is the correct path for
 * writing the tamper-proof `auth_events` audit log and reading recent attempts.
 *
 * NEVER import this from a client component — the `server-only` guard above turns
 * such an import into a build error.
 */
let adminInstance: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient | null {
  if (adminInstance) return adminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Degrade gracefully when unconfigured (local dev, CI) — mirrors createClient().
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  adminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminInstance;
}
