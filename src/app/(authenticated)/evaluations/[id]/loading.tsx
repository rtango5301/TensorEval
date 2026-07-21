export default function EvaluationDetailLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-4 w-32 rounded-[4px] bg-[var(--surface-container)]" />
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="mb-2 h-8 w-64 rounded-[4px] bg-[var(--surface-container)]" />
        <div className="h-4 w-48 rounded-[4px] bg-[var(--surface-container)]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-[8px] border border-[var(--outline-variant)] bg-white p-6" />
        <div className="h-64 rounded-[8px] border border-[var(--outline-variant)] bg-white p-6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4"
          >
            <div className="mb-2 h-4 w-24 rounded-[4px] bg-[var(--surface-container)]" />
            <div className="h-8 w-16 rounded-[4px] bg-[var(--surface-container)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
