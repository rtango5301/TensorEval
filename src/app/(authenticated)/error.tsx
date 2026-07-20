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
      <div className="max-w-md rounded-[8px] border border-red-200 bg-red-50 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
        <h2 className="font-display mb-1 text-lg font-bold text-red-800">Something went wrong</h2>
        <p className="text-sm text-red-600 mb-4">{error.message}</p>
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
