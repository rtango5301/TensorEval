'use client';

import { cn } from '@/lib/utils';

interface UsageQuotaBannerProps {
  used: number;
  limit: number;
  resourceName: string;
  periodEnd: string;
}

export function UsageQuotaBanner({ used, limit, resourceName, periodEnd }: UsageQuotaBannerProps) {
  // Exempt users (limit === -1) see no quota banner
  if (limit === -1) return null;

  const remaining = Math.max(0, limit - used);

  const resetDate = new Date(periodEnd).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (remaining >= 2) {
    // Subtle informational state
    return (
      <div className="flex items-center gap-3 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3">
        <span className="material-symbols-outlined text-lg text-[var(--outline)]">info</span>
        <p className="text-sm text-[var(--on-surface-variant)]">
          <span className="font-medium">{remaining}</span> of {limit} {resourceName} remaining this
          billing period.
        </p>
      </div>
    );
  }

  if (remaining === 1) {
    // Warning state
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
        <p className="text-sm text-amber-800">
          <span className="font-medium">1</span> {resourceName.replace(/s$/, '')} remaining this
          billing period. Quota resets {resetDate}.
        </p>
      </div>
    );
  }

  // Limit reached
  return (
    <div
      className={cn('bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3')}
    >
      <span className="material-symbols-outlined text-red-500 text-lg">block</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">
          {resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} Limit Reached
        </p>
        <p className="text-sm text-red-600">
          You&apos;ve used all {limit} {resourceName} this billing period. Quota resets {resetDate}.
        </p>
      </div>
    </div>
  );
}
