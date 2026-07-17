import 'server-only';

/**
 * Whether a Supabase user id is allowed to access admin-only surfaces (the login
 * telemetry dashboard). Controlled by the ADMIN_USER_IDS env var (comma-separated
 * UUIDs). Server-only: ADMIN_USER_IDS is not a NEXT_PUBLIC var and must never ship
 * to the client.
 */
export function isAdminUser(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const ids = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}
