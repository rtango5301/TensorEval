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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-2 h-14 shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-slate-900 text-base font-bold leading-tight">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openCalendly}
          className="px-4 py-2 bg-white border border-[#135bec] text-[#135bec] hover:bg-[#135bec]/5 rounded-lg text-sm font-bold transition-colors"
        >
          Schedule a call
        </button>
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </Link>
        <button className="flex items-center justify-center size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
        <AuthProfileDropdown user={user} />
      </div>
    </header>
  );
}
