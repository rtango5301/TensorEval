import 'server-only';

import { notFound } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { isAdminUser } from '@/lib/auth/admin-ids';
import type { AuthUser } from '@/contexts/user-context';

/**
 * Guards admin-only server components/routes. Requires an authenticated user
 * (redirects to /login otherwise) AND membership in ADMIN_USER_IDS. Non-admins
 * get a 404 (notFound) rather than a 403 so the route's existence isn't revealed.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();
  if (!isAdminUser(user.id)) {
    notFound();
  }
  return user;
}
