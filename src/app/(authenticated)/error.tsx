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
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
        <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
        <h2 className="text-lg font-bold text-red-800 mb-1">Something went wrong</h2>
        <p className="text-sm text-red-600 mb-4">
          {error.digest ? 'An unexpected error occurred.' : error.message}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#135bec] text-white rounded-lg text-sm font-bold hover:bg-[#135bec]/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
