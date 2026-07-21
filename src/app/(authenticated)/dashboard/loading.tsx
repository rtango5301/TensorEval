export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-7 w-52 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="animate-pulse">
          <div className="h-12 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-[var(--outline-variant)] px-6 py-4">
              <div className="h-4 w-1/3 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="ml-auto h-4 w-8 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-[8px] bg-[var(--surface-container)]" />
          <div>
            <div className="h-6 w-36 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
            <div className="mt-2 h-4 w-20 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
          </div>
        </div>
        <div className="h-4 w-20 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white"
          >
            <div className="p-4">
              <div className="mb-3 h-10 w-10 rounded-[8px] bg-[var(--surface-container)]" />
              <div className="mb-2 h-4 w-3/4 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-3 w-1/3 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
            <div className="flex items-center justify-between border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3">
              <div className="h-5 w-16 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-3 w-20 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
