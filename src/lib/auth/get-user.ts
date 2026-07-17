import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isAdminUser } from '@/lib/auth/admin-ids';
import type { AuthUser } from '@/contexts/user-context';

/**
 * Gets the authenticated user from Supabase and maps to AuthUser type.
 * Redirects to login if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<AuthUser> {
  const supabase = await createClient();

  if (!supabase) {
    // Supabase not configured - redirect to login
    redirect('/login');
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Extract user metadata from Supabase user
  const metadata = user.user_metadata || {};

  // Build display name from available data
  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username ||
    user.email?.split('@')[0] ||
    'User';

  // Get avatar URL (from Google OAuth or other providers)
  const avatarUrl = metadata.avatar_url || metadata.picture || undefined;

  return {
    id: user.id,
    email: user.email || '',
    name,
    avatarUrl,
    isAdmin: isAdminUser(user.id),
  };
}
