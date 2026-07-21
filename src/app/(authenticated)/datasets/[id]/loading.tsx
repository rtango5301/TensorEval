export default function DatasetDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-4 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-32 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="animate-pulse rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-64 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-6 w-20 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-6 w-16 rounded-[4px] bg-[var(--surface-container)]" />
        </div>
        <div className="mt-2 h-4 w-48 rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[8px] border border-[var(--outline-variant)] bg-white p-4"
          >
            <div className="mb-3 h-4 w-24 rounded-[4px] bg-[var(--surface-container)]" />
            <div className="h-8 w-16 rounded-[4px] bg-[var(--surface-container)]" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="animate-pulse">
          <div className="flex flex-col gap-4 border-b border-[var(--outline-variant)] px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="h-5 w-20 rounded-[4px] bg-[var(--surface-container)]" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-64 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-9 w-32 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          </div>
          <div className="h-12 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[var(--outline-variant)] px-6 py-4"
            >
              <div className="h-4 w-16 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-full max-w-md rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-6 w-20 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="ml-auto h-6 w-6 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
