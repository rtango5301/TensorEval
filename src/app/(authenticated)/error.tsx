'use client';

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="max-w-md rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-8 text-center">
        <span className="material-symbols-outlined text-[var(--error)] text-4xl mb-3">error</span>
        <h2 className="font-display mb-1 text-lg font-bold text-[var(--error-foreground)]">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--error-foreground)] mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
