import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/user-context';
import { AuthenticatedShell } from '@/components/layouts/authenticated-shell';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { PostHogIdentify } from '@/lib/posthog/provider';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = await getAuthenticatedUser();

  return (
    <UserProvider user={user}>
      <PostHogIdentify />
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </UserProvider>
  );
}
