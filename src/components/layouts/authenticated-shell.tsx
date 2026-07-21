'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { AuthenticatedHeader } from './authenticated-header';

interface AuthenticatedShellProps {
  children: ReactNode;
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] font-sans">
      <Sidebar />

      {/* Main Content Area */}
      <main className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <AuthenticatedHeader />

        {/* Page Content */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
