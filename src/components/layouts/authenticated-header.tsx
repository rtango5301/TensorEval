'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProfileDropdown } from '@/components/ui/auth-profile-dropdown';
import { useUser } from '@/contexts/user-context';
import { useCalendly } from '@/hooks/use-calendly';

/**
 * Derives page title from the current pathname
 */
function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/settings')) return 'Settings';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/datasets/new')) return 'New Dataset';
  if (pathname.startsWith('/datasets/')) return 'Dataset Details';
  if (pathname.startsWith('/datasets')) return 'Datasets';
  if (pathname.startsWith('/evaluations/new')) return 'New Evaluation';
  if (pathname.startsWith('/evaluations/configure')) return 'Configure Evaluation';
  if (pathname.startsWith('/evaluations/')) return 'Evaluation Details';
  if (pathname.startsWith('/evaluations')) return 'Evaluations';
  return 'TensorEval';
}

export function AuthenticatedHeader() {
  const pathname = usePathname();
  const user = useUser();
  const pageTitle = getPageTitle(pathname);
  const { openCalendly } = useCalendly();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[var(--outline-variant)] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] md:hidden">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="font-display text-base font-bold leading-tight text-[var(--on-surface)]">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openCalendly}
          className="rounded-[4px] border border-[var(--primary)] bg-white px-4 py-2 text-sm font-bold text-[var(--primary)] transition-colors hover:bg-[var(--surface-container-low)]"
        >
          Schedule a call
        </button>
        <Link
          href="/dashboard/settings"
          className="flex size-8 items-center justify-center rounded-[4px] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container)]"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </Link>
        <button className="flex size-8 items-center justify-center rounded-[4px] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container)]">
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
        <AuthProfileDropdown user={user} />
      </div>
    </header>
  );
}
