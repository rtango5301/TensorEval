'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

import { useEvaluations, useDeleteEvaluation } from '@/hooks/use-evaluations';
import type { Evaluation } from '@/lib/api/types';
import { useUsageQuota } from '@/hooks/use-usage-quota';
import { UsageQuotaBanner } from '@/components/ui/usage-quota-banner';

type StatusFilter = 'all' | 'running' | 'completed' | 'failed';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'running', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

// Map API status to UI status
function mapStatus(apiStatus: string): 'running' | 'completed' | 'failed' {
  switch (apiStatus) {
    case 'in_progress':
      return 'running';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'completed';
  }
}

function getStatusBadgeStyles(status: 'running' | 'completed' | 'failed') {
  switch (status) {
    case 'running':
      return 'border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]';
    case 'completed':
      return 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]';
    case 'failed':
      return 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]';
  }
}

function getStatusLabel(status: 'running' | 'completed' | 'failed') {
  switch (status) {
    case 'running':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
  }
}

// Format date relative to now
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Loading skeleton component
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[var(--outline-variant)] px-6 py-4"
        >
          <div className="h-4 w-48 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-4 w-20 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-4 w-24 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-4 w-16 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="ml-auto h-4 w-16 rounded-[4px] bg-[var(--surface-container)]" />
        </div>
      ))}
    </div>
  );
}

// Memoized table row component to avoid unnecessary re-renders
interface EvaluationRowProps {
  run: Evaluation;
  openMenuId: string | null;
  menuPosition: { top: number; left: number } | null;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: (runId: string, rect: DOMRect) => void;
  onCloseMenu: () => void;
  onOpenDeletePanel: (run: Evaluation) => void;
}

const EvaluationRow = React.memo(function EvaluationRow({
  run,
  openMenuId,
  menuPosition,
  menuRef,
  onToggleMenu,
  onCloseMenu,
  onOpenDeletePanel,
}: EvaluationRowProps) {
  const router = useRouter();
  const [showExportTooltip, setShowExportTooltip] = useState(false);
  const uiStatus = mapStatus(run.status);
  const passRate = run.results_summary
    ? (run.results_summary.overall_score * 100).toFixed(1)
    : null;
  const completed = run.results_summary
    ? run.results_summary.passed_count + run.results_summary.failed_count
    : 0;
  const total = run.results_summary?.total_count || 0;

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-[var(--surface-container-low)]"
      onClick={() => router.push(`/evaluations/${run.id}`)}
    >
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-[var(--on-surface)]">{run.name}</span>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
            getStatusBadgeStyles(uiStatus)
          )}
        >
          {uiStatus === 'running' && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
            </span>
          )}
          {getStatusLabel(uiStatus)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-[var(--on-surface-variant)]">
          {formatRelativeTime(run.created_at)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        {uiStatus === 'running' ? (
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono text-sm text-[var(--outline)]">
              {completed}/{total}
            </span>
            {total > 0 && (
              <div className="h-1.5 w-16 overflow-hidden rounded-[4px] bg-[var(--surface-container)]">
                <div
                  className="h-full rounded-[4px] bg-[var(--primary)] transition-all"
                  style={{ width: `${(completed / total) * 100}%` }}
                />
              </div>
            )}
          </div>
        ) : passRate !== null ? (
          <span
            className={`font-mono text-sm font-bold ${
              parseFloat(passRate) >= 90
                ? 'text-[var(--success-foreground)]'
                : parseFloat(passRate) >= 70
                  ? 'text-[var(--warning-foreground)]'
                  : 'text-[var(--error-foreground)]'
            }`}
          >
            {passRate}%
          </span>
        ) : (
          <span className="font-mono text-sm text-[var(--outline)]">--</span>
        )}
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block" ref={openMenuId === run.id ? menuRef : null}>
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onToggleMenu(run.id, rect);
            }}
            className="rounded-[4px] p-1.5 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
          {openMenuId === run.id && menuPosition && (
            <div
              className="animate-dropdown fixed z-50 w-52 rounded-[8px] border border-[var(--outline-variant)] bg-white py-2 shadow-xl"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <Link
                href={`/evaluations/${run.id}`}
                className="mx-2 flex items-center gap-3 rounded-[4px] px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
                onClick={onCloseMenu}
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                View Details
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
                onClick={() => onOpenDeletePanel(run)}
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

export default function EvaluationsPage() {
  const { evaluations, isLoading, error, refetch } = useEvaluations();
  const { deleteEvaluation, isDeleting } = useDeleteEvaluation();
  const { quota } = useUsageQuota();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Delete confirmation modal state
  const [deletingRun, setDeletingRun] = useState<Evaluation | null>(null);

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

  // Open delete confirmation for an evaluation run
  const openDeleteConfirm = useCallback((run: Evaluation) => {
    setDeletingRun(run);
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  // Toggle context menu for a row
  const handleToggleMenu = useCallback((runId: string, rect: DOMRect) => {
    setOpenMenuId((prev) => {
      if (prev === runId) {
        setMenuPosition(null);
        return null;
      }
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 208,
      });
      return runId;
    });
  }, []);

  // Close context menu
  const handleCloseMenu = useCallback(() => {
    setOpenMenuId(null);
    setMenuPosition(null);
  }, []);

  // Handle delete action
  const handleDelete = async () => {
    if (!deletingRun) return;
    const success = await deleteEvaluation(deletingRun.id);
    if (success) {
      setDeletingRun(null);
      refetch();
    }
  };

  // Find running evaluations for the banner
  const runningEvaluations = useMemo(() => {
    return evaluations.filter((run) => run.status === 'in_progress');
  }, [evaluations]);

  const filteredRuns = useMemo(() => {
    return evaluations.filter((run) => {
      const uiStatus = mapStatus(run.status);

      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (run.dataset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        run.id.includes(searchQuery) ||
        run.dataset_id.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus = statusFilter === 'all' || uiStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [evaluations, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* In Progress Banner */}
      {runningEvaluations.length > 0 && (
        <div className="rounded-[8px] border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {/* Pulsing dot */}
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--primary)]"></span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--primary)]">
                  Evaluation In Progress
                </span>
                <span className="text-[var(--primary)]">•</span>
                <span className="text-sm text-[var(--on-surface-variant)]">
                  {runningEvaluations[0].name}
                </span>
                {runningEvaluations[0].results_summary && (
                  <>
                    <span className="text-[var(--primary)]">•</span>
                    <span className="font-mono text-sm font-medium text-[var(--primary)]">
                      {runningEvaluations[0].results_summary.passed_count +
                        runningEvaluations[0].results_summary.failed_count}
                      /{runningEvaluations[0].results_summary.total_count} completed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Show additional running evaluations if more than one */}
          {runningEvaluations.length > 1 && (
            <p className="ml-6 mt-2 text-xs text-[var(--primary)]">
              +{runningEvaluations.length - 1} more evaluation
              {runningEvaluations.length > 2 ? 's' : ''} running
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
            Evaluation Runs
          </h1>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            View and manage your agent evaluation history.
          </p>
        </div>
        <Link
          href="/evaluations/new"
          className="flex w-fit items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Evaluation
        </Link>
      </div>

      {quota && (
        <UsageQuotaBanner
          used={quota.evaluations_used}
          limit={quota.evaluations_limit}
          resourceName="evaluations"
          periodEnd={quota.period_end}
        />
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-4">
          <span className="material-symbols-outlined text-[var(--error)]">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--error-foreground)]">
              Failed to load evaluations
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
              placeholder="Search by name, dataset, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] py-2.5 pl-10 pr-3 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--on-surface-variant)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-highlight)]"
            />
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-[var(--outline-variant)] md:block"></div>

          {/* Status Chips */}
          <div className="flex gap-2 overflow-x-auto py-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-[4px] px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Evaluation Name
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Started
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
                        {evaluations.length === 0 ? 'science' : 'search_off'}
                      </span>
                      <p className="text-sm text-[var(--on-surface-variant)]">
                        {evaluations.length === 0
                          ? 'No evaluations yet'
                          : 'No evaluation runs found'}
                      </p>
                      <p className="text-xs text-[var(--outline)]">
                        {evaluations.length === 0 ? (
                          <Link
                            href="/evaluations/new"
                            className="font-medium text-[var(--primary)] hover:underline"
                          >
                            Create your first evaluation
                          </Link>
                        ) : (
                          'Try adjusting your search or filter criteria'
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => (
                  <EvaluationRow
                    key={run.id}
                    run={run}
                    openMenuId={openMenuId}
                    menuPosition={menuPosition}
                    menuRef={menuRef}
                    onToggleMenu={handleToggleMenu}
                    onCloseMenu={handleCloseMenu}
                    onOpenDeletePanel={openDeleteConfirm}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {!isLoading && filteredRuns.length > 0 && (
        <div className="font-mono text-sm text-[var(--on-surface-variant)]">
          Showing {filteredRuns.length} of {evaluations.length} evaluation runs
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setDeletingRun(null)}
          />
          <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-[8px] bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--error)]/10">
              <span className="material-symbols-outlined text-2xl text-[var(--error)]">
                warning
              </span>
            </div>
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold text-[var(--on-surface)]">
                Delete Evaluation
              </h3>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[var(--on-surface)]">{deletingRun.name}</span>?
                {' This action cannot be undone.'}
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setDeletingRun(null)}
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
