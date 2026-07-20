'use client';

import { cn } from '@/lib/utils';

interface OrDividerProps {
  className?: string;
}

function OrDivider({ className }: OrDividerProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="h-px flex-1 bg-[var(--outline-variant)]" />
      <span className="text-sm font-medium uppercase text-[var(--outline)]">OR</span>
      <div className="h-px flex-1 bg-[var(--outline-variant)]" />
    </div>
  );
}

export { OrDivider };
