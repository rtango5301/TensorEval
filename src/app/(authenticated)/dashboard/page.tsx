// Dashboard Page - Recent Evaluation Runs
// Route: /dashboard

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn, getScoreColor, getScoreBarColor } from '@/lib/utils';
import { useEvaluations, useDeleteEvaluation } from '@/hooks/use-evaluations';
import { useDatasets } from '@/hooks/use-datasets';
import type { Evaluation, DatasetSource, DatasetStatus } from '@/lib/api/types';
import { useUsageQuota } from '@/hooks/use-usage-quota';
import { UsageQuotaBanner } from '@/components/ui/usage-quota-banner';

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Map API status to display status
type DisplayStatus = 'running' | 'completed' | 'failed';
function mapStatus(status: Evaluation['status']): DisplayStatus {
  switch (status) {
    case 'in_progress':
      return 'running';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'running';
  }
}

// Dataset mapping helpers
type UiDatasetType = 'uploaded' | 'generated';
type UiDatasetStatus = 'ready' | 'processing' | 'error';

function mapSourceToType(source: DatasetSource): UiDatasetType {
  return source === 'uploaded' ? 'uploaded' : 'generated';
}

function mapApiStatusToUiStatus(status: DatasetStatus): UiDatasetStatus {
  if (status === 'completed') return 'ready';
  if (status === 'in_progress') return 'processing';
  return 'error';
}

function formatDatasetDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadgeStyles(status: 'running' | 'completed' | 'failed') {
  switch (status) {
    case 'running':
      return 'border-[var(--primary)]/20 bg-[var(--surface-container)] text-[var(--primary)]';
    case 'completed':
      return 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]';
    case 'failed':
      return 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]';
  }
}

function getStatusLabel(status: 'running' | 'completed' | 'failed') {
  switch (status) {
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
  }
}

function getDatasetStatusStyles(status: 'ready' | 'processing' | 'error') {
  switch (status) {
    case 'ready':
      return 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]';
    case 'processing':
      return 'border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning-foreground)]';
    case 'error':
      return 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]';
  }
}

function getDatasetStatusLabel(status: 'ready' | 'processing' | 'error') {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'processing':
      return 'Processing';
    case 'error':
      return 'Error';
  }
}

function getDatasetTypeStyles(type: 'uploaded' | 'generated') {
  switch (type) {
    case 'uploaded':
      return {
        bg: 'bg-blue-100',
        icon: 'upload_file',
        iconColor: 'text-blue-600',
      };
    case 'generated':
      return {
        bg: 'bg-purple-100',
        icon: 'auto_awesome',
        iconColor: 'text-purple-600',
      };
  }
}

// Actions dropdown component
function ActionsDropdown({
  evalId,
  onDelete,
  isDeleting,
}: {
  evalId: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showExportTooltip, setShowExportTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      onDelete(evalId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-[4px] p-1.5 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
      >
        <span className="material-symbols-outlined text-lg">more_vert</span>
      </button>
      {isOpen && (
        <div className="animate-dropdown absolute right-0 top-full z-20 mt-2 w-52 rounded-[8px] border border-[var(--outline-variant)] bg-white py-2 shadow-xl">
          <Link
            href={`/evaluations/${evalId}`}
            className="mx-2 flex items-center gap-3 rounded-[4px] px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="mx-2 flex w-full items-center gap-3 rounded-[4px] px-4 py-2.5 text-left text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error-foreground)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { evaluations, isLoading, error, refetch } = useEvaluations();
  const { deleteEvaluation, isDeleting } = useDeleteEvaluation();
  const {
    datasets: apiDatasets,
    isLoading: datasetsLoading,
    error: datasetsError,
    refetch: refetchDatasets,
  } = useDatasets();
  const { quota } = useUsageQuota();

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteEvaluation(id);
    if (success) {
      refetch();
    }
  };

  // Get recent evaluations (limit to 5)
  const recentEvaluations = evaluations.slice(0, 5);

  // Map API datasets to UI format and limit to 3
  const recentDatasets = apiDatasets
    .map((d) => ({
      id: d.id,
      name: d.name,
      type: mapSourceToType(d.source),
      size: d.query_count,
      createdAt: formatDatasetDate(d.created_at),
      status: mapApiStatusToUiStatus(d.status),
    }))
    .slice(0, 3);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--on-surface)]">
              Recent Evaluations
            </h1>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              View and manage your recent evaluation runs.
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
        <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
          <div className="animate-pulse">
            <div className="h-12 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]"></div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b border-[var(--outline-variant)] px-6 py-4"
              >
                <div className="h-4 w-1/3 rounded-[4px] bg-[var(--surface-container)]"></div>
                <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]"></div>
                <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]"></div>
                <div className="h-4 w-1/6 rounded-[4px] bg-[var(--surface-container)]"></div>
                <div className="ml-auto h-4 w-8 rounded-[4px] bg-[var(--surface-container)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--on-surface)]">
              Recent Evaluations
            </h1>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              View and manage your recent evaluation runs.
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
        <div className="rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-6 text-center">
          <span className="material-symbols-outlined text-[var(--error)] text-3xl mb-2">error</span>
          <p className="text-[var(--error-foreground)] font-medium">Failed to load evaluations</p>
          <p className="text-[var(--error-foreground)] text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-[4px] bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error-foreground)] transition-colors hover:bg-[var(--error)]/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (recentEvaluations.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--on-surface)]">
              Recent Evaluations
            </h1>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              View and manage your recent evaluation runs.
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
        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
            <span className="material-symbols-outlined text-3xl text-[var(--outline)]">
              analytics
            </span>
          </div>
          <h3 className="font-display mb-2 text-lg font-bold text-[var(--on-surface)]">
            No evaluations yet
          </h3>
          <p className="mb-6 text-sm text-[var(--on-surface-variant)]">
            Create your first evaluation to start testing your AI agents.
          </p>
          <Link
            href="/evaluations/new"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            New Evaluation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--on-surface)]">
            Recent Evaluations
          </h1>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            View and manage your recent evaluation runs.
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

      {/* Table */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Evaluation Name
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {recentEvaluations.map((evaluation) => {
                const displayStatus = mapStatus(evaluation.status);
                const score = evaluation.results_summary?.overall_score ?? null;
                const progress = evaluation.progress ? parseInt(evaluation.progress, 10) : 0;

                return (
                  <tr
                    key={evaluation.id}
                    className="cursor-pointer transition-colors hover:bg-[var(--surface-container-low)]"
                    onClick={() => router.push(`/evaluations/${evaluation.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--on-surface)]">
                          {evaluation.name}
                        </span>
                        <span className="text-xs text-[var(--on-surface-variant)]">
                          {evaluation.dataset_name || 'Unknown Dataset'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--on-surface-variant)]">
                      {formatRelativeTime(evaluation.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
                          getStatusBadgeStyles(displayStatus)
                        )}
                      >
                        {displayStatus === 'running' && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                          </span>
                        )}
                        {displayStatus === 'completed' && (
                          <span className="flex h-2 w-2 rounded-[2px] bg-[var(--success)]"></span>
                        )}
                        {displayStatus === 'failed' && (
                          <span className="flex h-2 w-2 rounded-[2px] bg-[var(--error)]"></span>
                        )}
                        {getStatusLabel(displayStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {displayStatus === 'running' ? (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-[4px] bg-[var(--surface-container)]">
                            <div
                              className="h-full rounded-[4px] bg-[var(--primary)] transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm text-[var(--on-surface-variant)]">
                            {progress}%
                          </span>
                        </div>
                      ) : score !== null ? (
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'font-mono text-sm font-bold',
                              getScoreColor(score * 100)
                            )}
                          >
                            {(score * 100).toFixed(1)}%
                          </span>
                          <div className="h-2 w-16 overflow-hidden rounded-[4px] bg-[var(--surface-container)]">
                            <div
                              className={cn('h-full rounded-[4px]', getScoreBarColor(score * 100))}
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-[var(--outline)]">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionsDropdown
                        evalId={evaluation.id}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View All Link */}
      <div className="flex justify-center">
        <Link
          href="/evaluations"
          className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View all evaluations
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>

      {/* Datasets Section */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
              <span className="material-symbols-outlined text-[var(--on-surface-variant)]">
                storage
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[var(--on-surface)]">
                Your Datasets
              </h2>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {datasetsLoading ? 'Loading...' : `${apiDatasets.length} datasets`}
              </p>
            </div>
          </div>
          <Link
            href="/datasets"
            className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View All
            <span className="material-symbols-outlined text-base">arrow_forward</span>
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

        {/* Loading State */}
        {datasetsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white"
              >
                <div className="p-4">
                  <div className="mb-3 h-10 w-10 rounded-[8px] bg-[var(--surface-container)]"></div>
                  <div className="mb-2 h-4 w-3/4 rounded-[4px] bg-[var(--surface-container)]"></div>
                  <div className="h-3 w-1/3 rounded-[4px] bg-[var(--surface-container)]"></div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3">
                  <div className="h-5 w-16 rounded-[4px] bg-[var(--surface-container)]"></div>
                  <div className="h-3 w-20 rounded-[4px] bg-[var(--surface-container)]"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!datasetsLoading && datasetsError && (
          <div className="rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-6 text-center">
            <span className="material-symbols-outlined text-[var(--error)] text-3xl mb-2">
              error
            </span>
            <p className="text-[var(--error-foreground)] font-medium">Failed to load datasets</p>
            <p className="text-[var(--error-foreground)] text-sm mt-1">{datasetsError.message}</p>
            <button
              onClick={() => refetchDatasets()}
              className="mt-4 rounded-[4px] bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error-foreground)] transition-colors hover:bg-[var(--error)]/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!datasetsLoading && !datasetsError && recentDatasets.length === 0 && (
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
              <span className="material-symbols-outlined text-3xl text-[var(--outline)]">
                storage
              </span>
            </div>
            <h3 className="font-display mb-2 text-lg font-bold text-[var(--on-surface)]">
              No datasets yet
            </h3>
            <p className="mb-6 text-sm text-[var(--on-surface-variant)]">
              Create your first dataset to start evaluating your AI agents.
            </p>
            <Link
              href="/datasets/new"
              className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              New Dataset
            </Link>
          </div>
        )}

        {/* Card Grid */}
        {!datasetsLoading && !datasetsError && recentDatasets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDatasets.map((dataset) => {
              const typeStyles = getDatasetTypeStyles(dataset.type);
              return (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.id}`}
                  className="group cursor-pointer overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white transition-colors hover:border-[var(--primary)]"
                >
                  <div className="p-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'mb-3 flex h-10 w-10 items-center justify-center rounded-[8px]',
                        typeStyles.bg
                      )}
                    >
                      <span className={cn('material-symbols-outlined', typeStyles.iconColor)}>
                        {typeStyles.icon}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display line-clamp-1 text-sm font-medium text-[var(--on-surface)] transition-colors group-hover:text-[var(--primary)]">
                      {dataset.name}
                    </h3>

                    {/* Meta */}
                    <p className="mt-1 font-mono text-xs text-[var(--on-surface-variant)]">
                      {dataset.size} queries
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-xs font-medium',
                        getDatasetStatusStyles(dataset.status)
                      )}
                    >
                      {dataset.status === 'processing' ? (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--warning)] opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--warning)]"></span>
                        </span>
                      ) : dataset.status === 'ready' ? (
                        <span className="flex h-1.5 w-1.5 rounded-[2px] bg-[var(--success)]"></span>
                      ) : (
                        <span className="flex h-1.5 w-1.5 rounded-[2px] bg-[var(--error)]"></span>
                      )}
                      {getDatasetStatusLabel(dataset.status)}
                    </span>
                    <span className="text-xs text-[var(--outline)]">{dataset.createdAt}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {!datasetsLoading && !datasetsError && recentDatasets.length > 0 && (
          <div className="flex justify-center">
            <Link
              href="/datasets"
              className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all datasets
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
