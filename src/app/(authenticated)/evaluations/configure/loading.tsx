export default function ConfigureEvaluationLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-4 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-24 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-32 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-10 w-full rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
