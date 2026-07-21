export default function NewEvaluationLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-4 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-28 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-36 animate-pulse rounded-[4px] bg-[var(--surface-container)]"
            />
          ))}
        </div>
      </div>
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[8px] bg-[var(--surface-container)]" />
            <div>
              <div className="h-5 w-36 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="mt-1.5 h-3 w-52 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-28 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-10 w-full rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
