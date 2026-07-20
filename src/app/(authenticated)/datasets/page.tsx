'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { useDatasets, useDeleteDataset } from '@/hooks/use-datasets';
import type {
  Dataset as ApiDataset,
  DatasetSource,
  DatasetStatus as ApiDatasetStatus,
} from '@/lib/api/types';
import { useUsageQuota } from '@/hooks/use-usage-quota';
import { UsageQuotaBanner } from '@/components/ui/usage-quota-banner';

// UI Types (mapped from API types)
type UiDatasetType = 'uploaded' | 'generated';
type UiDatasetStatus = 'ready' | 'processing' | 'error';
type TypeFilter = 'all' | 'uploaded' | 'generated';

interface UiDataset {
  id: string;
  name: string;
  type: UiDatasetType;
  size: number;
  createdAt: string;
  status: UiDatasetStatus;
  description?: string;
}

// Map API source to UI type
function mapSourceToType(source: DatasetSource): UiDatasetType {
  switch (source) {
    case 'uploaded':
      return 'uploaded';
    case 'generated':
    case 'built_in':
    default:
      return 'generated';
  }
}

// Map API status to UI status
function mapApiStatusToUiStatus(status: ApiDatasetStatus): UiDatasetStatus {
  switch (status) {
    case 'completed':
      return 'ready';
    case 'in_progress':
      return 'processing';
    case 'failed':
      return 'error';
    case 'inactive':
    default:
      return 'error';
  }
}

// Convert API dataset to UI dataset
function mapApiDatasetToUiDataset(apiDataset: ApiDataset): UiDataset {
  return {
    id: apiDataset.id,
    name: apiDataset.name,
    type: mapSourceToType(apiDataset.source),
    size: apiDataset.query_count,
    createdAt: apiDataset.created_at,
    status: mapApiStatusToUiStatus(apiDataset.status),
    description: apiDataset.description,
  };
}

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'uploaded', label: 'File Upload' },
  { value: 'generated', label: 'AI Generated' },
];

function getTypeBadgeStyles(type: UiDatasetType) {
  switch (type) {
    case 'uploaded':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'generated':
      return 'bg-purple-100 text-purple-700 border-purple-200';
  }
}

function getTypeIcon(type: UiDatasetType) {
  switch (type) {
    case 'uploaded':
      return 'upload_file';
    case 'generated':
      return 'auto_awesome';
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Loading skeleton for table rows
function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="h-8 w-12 ml-auto" />
      </td>
    </tr>
  );
}

// Memoized table row component to avoid unnecessary re-renders
interface DatasetRowProps {
  dataset: UiDataset;
  openMenuId: string | null;
  menuPosition: { top: number; left: number } | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: (datasetId: string, rect: DOMRect) => void;
  onCloseMenu: () => void;
  onDelete: (dataset: UiDataset) => void;
}

const DatasetRow = React.memo(function DatasetRow({
  dataset,
  openMenuId,
  menuPosition,
  menuRef,
  onToggleMenu,
  onCloseMenu,
  onDelete,
}: DatasetRowProps) {
  const router = useRouter();
  const [showExportTooltip, setShowExportTooltip] = useState(false);
  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[var(--surface-container-low)]"
      onClick={() => router.push(`/datasets/${dataset.id}`)}
    >
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-[var(--on-surface)]">{dataset.name}</span>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
            getTypeBadgeStyles(dataset.type)
          )}
        >
          <span className="material-symbols-outlined text-sm">{getTypeIcon(dataset.type)}</span>
          {dataset.type === 'uploaded' ? 'Uploaded' : 'Generated'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-[var(--on-surface-variant)]">
          {dataset.size} queries
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-[var(--on-surface-variant)]">
          {formatDate(dataset.createdAt)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
            getStatusBadgeStyles(dataset.status)
          )}
        >
          {dataset.status === 'processing' && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--warning)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--warning)]"></span>
            </span>
          )}
          {getStatusLabel(dataset.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block" ref={openMenuId === dataset.id ? menuRef : null}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              onToggleMenu(dataset.id, rect);
            }}
            className="rounded-[4px] p-1.5 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
          {openMenuId === dataset.id && menuPosition && (
            <div
              className="animate-dropdown fixed z-50 w-52 rounded-[8px] border border-[var(--outline-variant)] bg-white py-2 shadow-xl"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <Link
                href={`/datasets/${dataset.id}`}
                className="mx-2 flex items-center gap-3 rounded-[4px] px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
                onClick={onCloseMenu}
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                View Details
              </Link>
              <Link
                href={`/evaluations/new?dataset=${dataset.id}`}
                className="mx-2 flex items-center gap-3 rounded-[4px] px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
                onClick={onCloseMenu}
              >
                <span className="material-symbols-outlined text-lg">science</span>
                Run Evaluation
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setShowExportTooltip(true)}
                onMouseLeave={() => setShowExportTooltip(false)}
              >
                <button
                  disabled
                  className="mx-2 flex w-full cursor-not-allowed items-center gap-3 rounded-[4px] px-4 py-2.5 text-left text-sm font-medium text-[var(--outline)]"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Export
                </button>
                {showExportTooltip && (
                  <div className="absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded-[8px] bg-[var(--inverse-surface)] px-3 py-2 text-xs font-medium text-[var(--inverse-on-surface)]">
                    Upgrade your membership
                    <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[var(--inverse-surface)]" />
                  </div>
                )}
              </div>
              <div className="mx-2 my-2 border-t border-[var(--outline-variant)]"></div>
              <button
                className="mx-2 flex w-full items-center gap-3 rounded-[4px] px-4 py-2.5 text-left text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error-foreground)]"
                onClick={() => onDelete(dataset)}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function DatasetsPage() {
  const { datasets: apiDatasets, isLoading, error, refetch } = useDatasets();
  const { deleteDataset, isDeleting } = useDeleteDataset();
  const { quota } = useUsageQuota();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Delete confirmation modal state
  const [deletingDataset, setDeletingDataset] = useState<UiDataset | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map API datasets to UI datasets
  const datasets = useMemo(() => {
    return apiDatasets.map(mapApiDatasetToUiDataset);
  }, [apiDatasets]);

  // Open delete confirmation for a dataset
  const openDeleteConfirm = useCallback((dataset: UiDataset) => {
    setDeletingDataset(dataset);
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  // Toggle context menu for a row
  const handleToggleMenu = useCallback((datasetId: string, rect: DOMRect) => {
    setOpenMenuId((prev) => {
      if (prev === datasetId) {
        setMenuPosition(null);
        return null;
      }
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 208,
      });
      return datasetId;
    });
  }, []);

  // Close context menu
  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  // Handle delete dataset
  const handleDelete = async () => {
    if (!deletingDataset) return;
    const success = await deleteDataset(deletingDataset.id);
    if (success) {
      setDeletingDataset(null);
      refetch();
    }
  };

  const filteredDatasets = useMemo(() => {
    const result = datasets.filter((dataset) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by type
      const matchesType = typeFilter === 'all' || dataset.type === typeFilter;

      return matchesSearch && matchesType;
    });

    // Sort by newest first
    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [datasets, searchQuery, typeFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
            Datasets
          </h1>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Manage your evaluation datasets and test cases.
          </p>
        </div>
        <Link
          href="/datasets/new"
          className="flex w-fit items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Dataset
        </Link>
      </div>

      {quota && (
        <UsageQuotaBanner
          used={quota.datasets_used}
          limit={quota.datasets_limit}
          resourceName="datasets"
          periodEnd={quota.period_end}
        />
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search & Filters */}
        <div className="flex flex-1 w-full md:w-auto items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-xl text-[var(--outline)]">
                search
              </span>
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] py-2.5 pl-10 pr-3 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--on-surface-variant)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-highlight)]"
            />
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-[var(--outline-variant)] md:block"></div>

          {/* Type Chips */}
          <div className="flex gap-2 overflow-x-auto py-1">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-[4px] px-3 py-1.5 text-sm font-medium transition-colors',
                  typeFilter === filter.value
                    ? 'bg-[var(--inverse-surface)] text-[var(--inverse-on-surface)]'
                    : 'border border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-4">
          <span className="material-symbols-outlined text-[var(--error)]">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--error-foreground)]">
              Failed to load datasets
            </p>
            <p className="text-sm text-[var(--error-foreground)]">{error.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-[4px] bg-[var(--error)]/10 px-3 py-1.5 text-sm font-medium text-[var(--error-foreground)] transition-colors hover:bg-[var(--error)]/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Size
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Created On
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {isLoading ? (
                // Loading skeletons
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {datasets.length === 0 ? (
                        // Empty state - no datasets at all
                        <>
                          <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
                            folder_open
                          </span>
                          <p className="text-sm text-[var(--on-surface-variant)]">
                            No datasets yet
                          </p>
                          <p className="text-xs text-[var(--outline)]">
                            Create your first dataset to get started
                          </p>
                          <Link
                            href="/datasets/new"
                            className="mt-2 flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Create Dataset
                          </Link>
                        </>
                      ) : (
                        // No results for current filter
                        <>
                          <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
                            search_off
                          </span>
                          <p className="text-sm text-[var(--on-surface-variant)]">
                            No datasets found
                          </p>
                          <p className="text-xs text-[var(--outline)]">
                            Try adjusting your search or filter criteria
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((dataset) => (
                  <DatasetRow
                    key={dataset.id}
                    dataset={dataset}
                    openMenuId={openMenuId}
                    menuPosition={menuPosition}
                    menuRef={menuRef}
                    onToggleMenu={handleToggleMenu}
                    onCloseMenu={handleCloseMenu}
                    onDelete={openDeleteConfirm}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {!isLoading && filteredDatasets.length > 0 && (
        <div className="font-mono text-sm text-[var(--on-surface-variant)]">
          Showing {filteredDatasets.length} of {datasets.length} datasets
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setDeletingDataset(null)}
          />
          <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-[8px] bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--error)]/10">
              <span className="material-symbols-outlined text-[var(--error)] text-2xl">
                warning
              </span>
            </div>
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold text-[var(--on-surface)]">
                Delete Dataset
              </h3>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[var(--on-surface)]">
                  {deletingDataset.name}
                </span>
                {'? This action cannot be undone.'}
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setDeletingDataset(null)}
                disabled={isDeleting}
                className="flex-1 rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-[4px] bg-[var(--error)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--error-foreground)] disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">
                      progress_activity
                    </span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
