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
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'processing':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'error':
      return 'bg-red-100 text-red-700 border-red-200';
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
    general: 'bg-slate-100 text-slate-700',
    safety: 'bg-red-100 text-red-700',
    performance: 'bg-purple-100 text-purple-700',
  };
  return colors[category.toLowerCase()] || 'bg-slate-100 text-slate-700';
}

// Loading skeletons
function HeaderSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
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
        <Skeleton className="h-6 w-20 rounded-full" />
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
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/datasets" className="hover:text-[#135bec] transition-colors">
            Datasets
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 font-medium">Error</span>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
          <h2 className="text-lg font-bold text-red-800 mb-2">Failed to load dataset</h2>
          <p className="text-sm text-red-600 mb-4">{error.message}</p>
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-amber-600 animate-spin">
                progress_activity
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-800">
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-red-600">error</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800">Dataset Generation Failed</h3>
              <p className="text-xs text-red-600 mt-1">
                There was an error generating your dataset. Please try again or contact support if
                the issue persists.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/datasets" className="hover:text-[#135bec] transition-colors">
          Datasets
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-slate-900 font-medium">
          {isLoading ? <Skeleton className="h-4 w-32 inline-block" /> : dataset?.name}
        </span>
      </div>

      {/* Header Card */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : dataset ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{dataset.name}</h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
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
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getStatusBadgeStyles(uiStatus)
                  )}
                >
                  {uiStatus === 'processing' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                  {getStatusLabel(uiStatus)}
                </span>
                {isPolling && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Updating...
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">
                <span className="font-mono">{id}</span> &bull; Created on{' '}
                {new Date(dataset.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {dataset.description && (
                <p className="text-slate-600 text-sm mt-2">{dataset.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/evaluations/new?dataset=${id}`}
                className="flex items-center gap-2 bg-[#135bec] hover:bg-[#135bec]/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm shadow-[#135bec]/30"
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
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Export
                </button>
                {/* Tooltip */}
                {showExportTooltip && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-10 shadow-lg">
                    Upgrade your membership
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Total Queries</span>
            <span className="material-symbols-outlined text-[#135bec]">quiz</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {isLoading ? <Skeleton className="h-8 w-16" /> : dataset?.query_count || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Categories</span>
            <span className="material-symbols-outlined text-[#135bec]">category</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {isLoading ? <Skeleton className="h-8 w-8" /> : categories.length}
          </div>
          {!isLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={cn('px-2 py-0.5 rounded text-xs font-medium', getCategoryColor(cat))}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Queries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-slate-200 gap-4">
          <h2 className="text-lg font-bold text-slate-900">Queries</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-64 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
              />
            </div>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
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
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
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
                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'hourglass_empty'
                          : 'search_off'}
                      </span>
                      <p className="text-slate-500 text-sm">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'No queries yet'
                          : 'No queries match your filter'}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {filteredQueries.length === 0 && dataset?.queries?.length === 0
                          ? 'Queries will appear here once processing completes'
                          : 'Try adjusting your search or filter'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQueries.map((query) => (
                  <tr key={query.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">
                      {query.query_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 line-clamp-2">{query.query}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getCategoryColor(query.category)
                        )}
                      >
                        {query.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedQuery(query)}
                        className="text-slate-400 hover:text-[#135bec] transition-colors"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * queriesPerPage + 1} to{' '}
              {Math.min(currentPage * queriesPerPage, filteredQueries.length)} of{' '}
              {filteredQueries.length} queries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'p-2 rounded-lg border transition-colors',
                  currentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                )}
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-[#135bec] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={cn(
                  'p-2 rounded-lg border transition-colors',
                  currentPage === totalPages || totalPages === 0
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#135bec]">quiz</span>
                <h3 className="text-lg font-bold text-slate-900">Query Details</h3>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Query ID
                  </label>
                  <p className="text-sm font-mono text-slate-700 mt-1">{selectedQuery.query_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getCategoryColor(selectedQuery.category)
                      )}
                    >
                      {selectedQuery.category}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Query Text
                  </label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-900">{selectedQuery.query}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Reference Answer
                  </label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-900">{selectedQuery.reference_answer}</p>
                  </div>
                </div>
                {selectedQuery.rubric && selectedQuery.rubric.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Rubric
                    </label>
                    <div className="mt-1 space-y-2">
                      {selectedQuery.rubric.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-slate-900">{item.name}</span>
                            <span className="text-xs font-mono text-slate-500">
                              Weight: {item.weight}
                            </span>
                          </div>
                          {item.rubric && (
                            <p className="text-sm text-slate-600 mt-1">{item.rubric}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
