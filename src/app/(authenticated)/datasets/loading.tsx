export default function DatasetsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-36 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-64 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-8 w-px bg-[var(--outline-variant)]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-[4px] bg-[var(--surface-container)]"
          />
        ))}
      </div>
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="animate-pulse">
          <div className="h-12 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[var(--outline-variant)] px-6 py-4"
            >
              <div className="h-4 w-40 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-6 w-24 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-20 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-4 w-24 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="h-6 w-20 rounded-[4px] bg-[var(--surface-container)]" />
              <div className="ml-auto h-8 w-12 rounded-[4px] bg-[var(--surface-container)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
