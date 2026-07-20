export default function NewDatasetLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-4 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-24 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div>
        <div className="h-8 w-56 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, panel) => (
          <div
            key={panel}
            className="animate-pulse overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white"
          >
            <div className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[8px] bg-[var(--surface-container)]" />
                <div>
                  <div className="h-5 w-36 rounded-[4px] bg-[var(--surface-container)]" />
                  <div className="mt-1.5 h-3 w-48 rounded-[4px] bg-[var(--surface-container)]" />
                </div>
              </div>
            </div>
            <div className="space-y-5 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-2 h-4 w-28 rounded-[4px] bg-[var(--surface-container)]" />
                  <div className="h-10 w-full rounded-[4px] bg-[var(--surface-container)]" />
                </div>
              ))}
              <div className="h-32 w-full rounded-[8px] bg-[var(--surface-container)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
