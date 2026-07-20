'use client';

import { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useDatasetWithPolling } from '@/hooks/use-datasets';
import type { DatasetQuery, DatasetSource, DatasetStatus } from '@/lib/api/types';

// UI Type mappings
type UiDatasetType = 'uploaded' | 'generated';
type UiDatasetStatus = 'ready' | 'processing' | 'error';

function mapSourceToType(source: DatasetSource): UiDatasetType {
  return source === 'uploaded' ? 'uploaded' : 'generated';
}

function mapApiStatusToUiStatus(status: DatasetStatus): UiDatasetStatus {
  switch (status) {
    case 'completed':
      return 'ready';
    case 'in_progress':
      return 'processing';
    case 'failed':
    case 'inactive':
    default:
      return 'error';
  }
}

function getTypeBadgeStyles(type: UiDatasetType) {
  switch (type) {
    case 'uploaded':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'generated':
      return 'bg-purple-100 text-purple-700 border-purple-200';
  }
}

function getStatusBadgeStyles(status: UiDatasetStatus) {
  switch (status) {
    case 'ready':
      return 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]';
    case 'processing':
      return 'border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning-foreground)]';
    case 'error':
      return 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]';
  }
}

function getStatusLabel(status: UiDatasetStatus) {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'processing':
      return 'Processing';
    case 'error':
      return 'Error';
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    account: 'bg-blue-100 text-blue-700',
    billing: 'bg-emerald-100 text-emerald-700',
    technical: 'bg-amber-100 text-amber-700',
    general: 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]',
    safety: 'bg-red-100 text-red-700',
    performance: 'bg-purple-100 text-purple-700',
  };
  return (
    colors[category.toLowerCase()] ||
    'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
  );
}

// Loading skeletons
function HeaderSkeleton() {
  return (
    <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-full max-w-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-6" />
      </td>
    </tr>
  );
}

export default function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { dataset, isLoading, error, isPolling } = useDatasetWithPolling(id);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<DatasetQuery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showExportTooltip, setShowExportTooltip] = useState(false);

  const queriesPerPage = 5;

  // Extract unique categories from queries
  const categories = useMemo(() => {
    if (!dataset?.queries) return [];
    const cats = new Set(dataset.queries.map((q) => q.category));
    return Array.from(cats);
  }, [dataset?.queries]);

  // Filter queries
  const filteredQueries = useMemo(() => {
    if (!dataset?.queries) return [];
    return dataset.queries.filter((query) => {
      const matchesSearch =
        searchQuery === '' || query.query.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || query.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [dataset?.queries, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage);
  const paginatedQueries = filteredQueries.slice(
    (currentPage - 1) * queriesPerPage,
    currentPage * queriesPerPage
  );

  // Map to UI types
  const uiType = dataset ? mapSourceToType(dataset.source) : 'generated';
  const uiStatus = dataset ? mapApiStatusToUiStatus(dataset.status) : 'processing';

  const handleRetry = () => {
    // Handle retry logic - in a real app this would trigger dataset regeneration
    console.log('Retrying dataset generation...');
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <Link href="/datasets" className="transition-colors hover:text-[var(--primary)]">
            Datasets
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-medium text-[var(--on-surface)]">Error</span>
        </div>

        <div className="rounded-[8px] border border-red-200 bg-red-50 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
          <h2 className="font-display mb-2 text-lg font-bold text-red-800">
            Failed to load dataset
          </h2>
          <p className="text-sm text-red-600 mb-4">{error.message}</p>
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 rounded-[4px] bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Datasets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Processing Status Banner */}
      {uiStatus === 'processing' && (
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-amber-600 animate-spin">
                progress_activity
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-semibold text-amber-800">
                Dataset Generation In Progress
              </h3>
              <p className="text-xs text-amber-600 mt-1">
                Please wait while we generate your dataset. This may take a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Status Banner */}
      {uiStatus === 'error' && (
        <div className="rounded-[8px] border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-red-600">error</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-semibold text-red-800">
                Dataset Generation Failed
              </h3>
              <p className="text-xs text-red-600 mt-1">
                There was an error generating your dataset. Please try again or contact support if
                the issue persists.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex shrink-0 items-center gap-1.5 rounded-[4px] bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Link href="/datasets" className="transition-colors hover:text-[var(--primary)]">
          Datasets
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="font-medium text-[var(--on-surface)]">
          {isLoading ? <Skeleton className="h-4 w-32 inline-block" /> : dataset?.name}
        </span>
      </div>

      {/* Header Card */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : dataset ? (
        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl font-bold text-[var(--on-surface)]">
                  {dataset.name}
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
                    getTypeBadgeStyles(uiType)
                  )}
                >
                  <span className="material-symbols-outlined text-sm">
                    {uiType === 'uploaded' ? 'upload_file' : 'auto_awesome'}
                  </span>
                  {uiType === 'uploaded' ? 'Uploaded' : 'Generated'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
                    getStatusBadgeStyles(uiStatus)
                  )}
                >
                  {uiStatus === 'processing' && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--warning)] opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--warning)]"></span>
                    </span>
                  )}
                  {getStatusLabel(uiStatus)}
                </span>
                {isPolling && (
                  <span className="flex items-center gap-1 text-xs text-[var(--outline)]">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Updating...
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">
                <span className="font-mono">{id}</span> &bull; Created on{' '}
                {new Date(dataset.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {dataset.description && (
                <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                  {dataset.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/evaluations/new?dataset=${id}`}
                className="flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
              >
                <span className="material-symbols-outlined text-lg">science</span>
                Run Evaluation
              </Link>
              {/* Export Button with Pro Lock */}
              <div
                className="relative"
                onMouseEnter={() => setShowExportTooltip(true)}
                onMouseLeave={() => setShowExportTooltip(false)}
              >
                <button
                  disabled
                  className="flex cursor-not-allowed items-center gap-1.5 rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm font-medium text-[var(--outline)]"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Export
                </button>
                {/* Tooltip */}
                {showExportTooltip && (
                  <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[var(--inverse-surface)] px-3 py-2 text-xs font-medium text-[var(--inverse-on-surface)]">
                    Upgrade your membership
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--inverse-surface)]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--on-surface-variant)]">
              Total Queries
            </span>
            <span className="material-symbols-outlined text-[var(--primary)]">quiz</span>
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--on-surface)]">
            {isLoading ? <Skeleton className="h-8 w-16" /> : dataset?.query_count || 0}
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--on-surface-variant)]">Categories</span>
            <span className="material-symbols-outlined text-[var(--primary)]">category</span>
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--on-surface)]">
            {isLoading ? <Skeleton className="h-8 w-8" /> : categories.length}
          </div>
          {!isLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={cn(
                    'rounded-[4px] px-2 py-0.5 text-xs font-medium',
                    getCategoryColor(cat)
                  )}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Queries Table */}
      <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="flex flex-col gap-4 border-b border-[var(--outline-variant)] px-6 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">Queries</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[var(--outline)]">
                search
              </span>
              <input
                type="text"
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-[4px] border border-[var(--outline-variant)] py-2 pl-9 pr-3 text-sm transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-[4px] border border-[var(--outline-variant)] px-3 py-2 text-sm text-[var(--on-surface-variant)] transition-colors focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <th className="w-16 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Query
                </th>
                <th className="w-32 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Category
                </th>
                <th className="w-20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : paginatedQueries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'hourglass_empty'
                          : 'search_off'}
                      </span>
                      <p className="text-sm text-[var(--on-surface-variant)]">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'No queries yet'
                          : 'No queries match your filter'}
                      </p>
                      <p className="text-xs text-[var(--outline)]">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'Queries will appear here once processing completes'
                          : 'Try adjusting your search or filter'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQueries.map((query) => (
                  <tr
                    key={query.id}
                    className="transition-colors hover:bg-[var(--surface-container-low)]"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-[var(--on-surface-variant)]">
                      {query.query_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-sm text-[var(--on-surface)]">{query.query}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'rounded-[4px] px-2.5 py-0.5 text-xs font-medium',
                          getCategoryColor(query.category)
                        )}
                      >
                        {query.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedQuery(query)}
                        className="text-[var(--outline)] transition-colors hover:text-[var(--primary)]"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredQueries.length > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
            <p className="font-mono text-sm text-[var(--on-surface-variant)]">
              Showing {(currentPage - 1) * queriesPerPage + 1} to{' '}
              {Math.min(currentPage * queriesPerPage, filteredQueries.length)} of{' '}
              {filteredQueries.length} queries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'rounded-[4px] border p-2 transition-colors',
                  currentPage === 1
                    ? 'cursor-not-allowed border-[var(--outline-variant)] text-[var(--outline)] opacity-50'
                    : 'border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                )}
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'rounded-[4px] px-3 py-1.5 text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={cn(
                  'rounded-[4px] border p-2 transition-colors',
                  currentPage === totalPages || totalPages === 0
                    ? 'cursor-not-allowed border-[var(--outline-variant)] text-[var(--outline)] opacity-50'
                    : 'border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                )}
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[8px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary)]">quiz</span>
                <h3 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Query Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="rounded-[4px] p-1 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Query ID
                  </label>
                  <p className="mt-1 font-mono text-sm text-[var(--on-surface-variant)]">
                    {selectedQuery.query_id}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Category
                  </label>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'rounded-[4px] px-2.5 py-0.5 text-xs font-medium',
                        getCategoryColor(selectedQuery.category)
                      )}
                    >
                      {selectedQuery.category}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Query Text
                  </label>
                  <div className="mt-1 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                    <p className="text-sm text-[var(--on-surface)]">{selectedQuery.query}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Reference Answer
                  </label>
                  <div className="mt-1 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                    <p className="text-sm text-[var(--on-surface)]">
                      {selectedQuery.reference_answer}
                    </p>
                  </div>
                </div>
                {selectedQuery.rubric && selectedQuery.rubric.length > 0 && (
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                      Rubric
                    </label>
                    <div className="mt-1 space-y-2">
                      {selectedQuery.rubric.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-[var(--on-surface)]">
                              {item.name}
                            </span>
                            <span className="font-mono text-xs text-[var(--on-surface-variant)]">
                              Weight: {item.weight}
                            </span>
                          </div>
                          {item.rubric && (
                            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                              {item.rubric}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
