'use client';

import { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { cn, getScoreColor, getScoreBarColor, getScoreHexColor } from '@/lib/utils';
import { DebugViewPanel } from '@/components/debug-view-panel';
import { useEvaluationWithPolling } from '@/hooks/use-evaluations';
import type { EvaluationResult as ApiEvaluationResult } from '@/lib/api/types';

// Category badge color mapping
function getCategoryBadgeStyles(category: string): string {
  const categoryColors: Record<string, string> = {
    'Data Analysis': 'bg-blue-100 text-blue-700 border-blue-200',
    data_analysis: 'bg-blue-100 text-blue-700 border-blue-200',
    Safety: 'bg-red-100 text-red-700 border-red-200',
    safety: 'bg-red-100 text-red-700 border-red-200',
    Calculations: 'bg-purple-100 text-purple-700 border-purple-200',
    calculations: 'bg-purple-100 text-purple-700 border-purple-200',
    'Report Generation': 'bg-amber-100 text-amber-700 border-amber-200',
    report_generation: 'bg-amber-100 text-amber-700 border-amber-200',
    customer_support: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    categoryColors[category] ||
    'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
  );
}

// Format category name for display
function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Bar chart component for category scores
function CategoryBarChart({ data }: { data: { name: string; score: number; count: number }[] }) {
  const maxScore = 100;

  if (data.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[var(--on-surface-variant)]">
        No category data available
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
      {data.map((category) => (
        <div key={category.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--on-surface-variant)]">
              {formatCategory(category.name)}
            </span>
            <span className={cn('font-mono font-bold', getScoreColor(category.score))}>
              {category.score.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-[4px] bg-[var(--surface-container-low)]">
            <div
              className={cn(
                'absolute h-full rounded-[4px] transition-all duration-500',
                getScoreBarColor(category.score)
              )}
              style={{ width: `${(category.score / maxScore) * 100}%` }}
            />
          </div>
          <p className="font-mono text-xs text-[var(--outline)]">{category.count} queries</p>
        </div>
      ))}
    </div>
  );
}

// Circular progress for overall score
function OverallScoreCircle({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--brand-secondary)"
          strokeOpacity="0.15"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={getScoreHexColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-4xl font-bold text-[var(--on-surface)]">
          {score.toFixed(1)}%
        </span>
        <span className="text-sm text-[var(--on-surface-variant)]">Overall Score</span>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
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
    </div>
  );
}

export default function EvaluationResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { evaluation, isLoading, error, isPolling } = useEvaluationWithPolling(id);

  const [resultFilter, setResultFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [selectedResult, setSelectedResult] = useState<ApiEvaluationResult | null>(null);
  const [showExportTooltip, setShowExportTooltip] = useState(false);

  // Calculate category scores from results
  const categoryScores = useMemo(() => {
    if (!evaluation?.results || evaluation.results.length === 0) return [];

    const categories: Record<string, { total: number; count: number }> = {};
    evaluation.results.forEach((result) => {
      if (!categories[result.category]) {
        categories[result.category] = { total: 0, count: 0 };
      }
      categories[result.category].total += result.score * 100;
      categories[result.category].count += 1;
    });

    return Object.entries(categories)
      .map(([name, { total, count }]) => ({
        name,
        score: total / count,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [evaluation?.results]);

  // Filter results
  const filteredResults = useMemo(() => {
    if (!evaluation?.results) return [];
    return evaluation.results.filter((r) => {
      if (resultFilter === 'all') return true;
      return r.pass_fail === resultFilter;
    });
  }, [evaluation?.results, resultFilter]);

  // Convert API result to DebugViewPanel format
  const convertToDebugFormat = (result: ApiEvaluationResult | null) => {
    if (!result) return null;
    return {
      id: parseInt(result.query_id.replace('q_', ''), 10) || 0,
      query: result.query,
      expectedOutput: result.grader_reasoning,
      actualOutput: result.agent_response,
      latency: result.latency_ms,
      score: result.score * 100,
      status: result.pass_fail === 'pass' ? 'passed' : 'failed',
    } as const;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <Link href="/evaluations" className="transition-colors hover:text-[var(--primary)]">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-medium text-[var(--on-surface)]">Error</span>
        </div>
        <div className="rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-6 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-[var(--error)]">error</span>
          <p className="font-medium text-[var(--error-foreground)]">{error.message}</p>
          <Link
            href="/evaluations"
            className="mt-4 inline-block text-sm text-[var(--error-foreground)] hover:underline"
          >
            Back to evaluations
          </Link>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <Link href="/evaluations" className="transition-colors hover:text-[var(--primary)]">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-medium text-[var(--on-surface)]">Not Found</span>
        </div>
        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-[var(--outline)]">
            search_off
          </span>
          <p className="text-[var(--on-surface-variant)]">Evaluation not found</p>
          <Link
            href="/evaluations"
            className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline"
          >
            Back to evaluations
          </Link>
        </div>
      </div>
    );
  }

  const isRunning = evaluation.status === 'in_progress';
  const isCompleted = evaluation.status === 'completed';
  const isFailed = evaluation.status === 'failed';

  const overallScore = evaluation.results_summary?.overall_score
    ? evaluation.results_summary.overall_score * 100
    : 0;
  const passedCount = evaluation.results_summary?.passed_count || 0;
  const failedCount = evaluation.results_summary?.failed_count || 0;
  const totalCount = evaluation.results_summary?.total_count || 0;
  const avgLatency = evaluation.results_summary?.avg_latency_ms || 0;
  const completedCount = passedCount + failedCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Link href="/evaluations" className="transition-colors hover:text-[var(--primary)]">
          Evaluations
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="font-mono font-medium text-[var(--on-surface)]">
          Run #{id.slice(0, 8)}
        </span>
      </div>

      {/* Header Card */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-[var(--on-surface)]">
                {evaluation.name}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
                  isCompleted
                    ? 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]'
                    : isRunning
                      ? 'border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]'
                )}
              >
                {isRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                  </span>
                )}
                {isCompleted ? 'Completed' : isRunning ? 'Running' : 'Failed'}
              </span>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {evaluation.dataset_name && (
                <>
                  Dataset:{' '}
                  <Link
                    href={`/datasets/${evaluation.dataset_id}`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {evaluation.dataset_name}
                  </Link>
                </>
              )}
              {evaluation.progress && isRunning && (
                <span className="ml-2 font-mono">• {evaluation.progress}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <>
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
                  {showExportTooltip && (
                    <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[var(--inverse-surface)] px-3 py-2 text-xs font-medium text-[var(--inverse-on-surface)]">
                      Upgrade your membership
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--inverse-surface)]" />
                    </div>
                  )}
                </div>
                <Link
                  href={`/evaluations/new?dataset=${evaluation.dataset_id}`}
                  className="flex items-center gap-1.5 rounded-[4px] bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                >
                  <span className="material-symbols-outlined text-lg">replay</span>
                  Re-run
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Failed status message */}
      {isFailed && (
        <div className="rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[var(--error)]">error</span>
            <div>
              <p className="text-sm font-medium text-[var(--error-foreground)]">
                Evaluation Failed
              </p>
              <p className="text-sm text-[var(--error-foreground)]">
                {evaluation.progress || 'An error occurred during evaluation'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid (for running evaluations) */}
      {isRunning && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Batch Progress Card */}
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                Batch Progress
              </span>
              <span className="material-symbols-outlined text-[var(--brand-secondary)]">
                donut_large
              </span>
            </div>
            <div className="mb-1 font-mono text-2xl font-bold text-[var(--on-surface)]">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div className="mb-3 font-mono text-sm text-[var(--on-surface-variant)]">
              {completedCount} / {totalCount} Queries
            </div>
            <div className="h-2 w-full overflow-hidden rounded-[4px] bg-[var(--surface-container-low)]">
              <div
                className="h-full rounded-[4px] bg-[var(--primary)] transition-all duration-500 ease-out"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Passed Card */}
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">Passed</span>
              <span className="material-symbols-outlined text-[var(--success)]">check_circle</span>
            </div>
            <div className="mb-1 font-mono text-2xl font-bold text-[var(--success-foreground)]">
              {passedCount}
            </div>
            <div className="font-mono text-sm text-[var(--on-surface-variant)]">
              <span className="font-semibold text-[var(--success-foreground)]">
                {completedCount > 0 ? ((passedCount / completedCount) * 100).toFixed(1) : '0.0'}%
              </span>{' '}
              Rate
            </div>
          </div>

          {/* Failed Card */}
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">Failed</span>
              <span className="material-symbols-outlined text-[var(--error)]">cancel</span>
            </div>
            <div className="mb-1 font-mono text-2xl font-bold text-[var(--error-foreground)]">
              {failedCount}
            </div>
            <div className="font-mono text-sm text-[var(--on-surface-variant)]">
              <span className="font-semibold text-[var(--error-foreground)]">
                {completedCount > 0 ? ((failedCount / completedCount) * 100).toFixed(1) : '0.0'}%
              </span>{' '}
              Rate
            </div>
          </div>

          {/* Avg Latency Card */}
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                Avg Latency
              </span>
              <span className="material-symbols-outlined text-[var(--primary)]">speed</span>
            </div>
            <div className="mb-1 font-mono text-2xl font-bold text-[var(--on-surface)]">
              {avgLatency}ms
            </div>
            <div className="text-sm text-[var(--on-surface-variant)]">Per query</div>
          </div>
        </div>
      )}

      {/* Completed View: Overall Score + Charts */}
      {isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <div className="flex flex-col items-center justify-center rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
            <OverallScoreCircle score={overallScore} />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-[var(--success)]"></span>
                <span className="font-mono text-[var(--on-surface-variant)]">
                  {passedCount} Passed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-[var(--error)]"></span>
                <span className="font-mono text-[var(--on-surface-variant)]">
                  {failedCount} Failed
                </span>
              </div>
            </div>
          </div>

          {/* Score by Category */}
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-[var(--on-surface)]">
              <span className="material-symbols-outlined text-lg text-[var(--brand-secondary)]">
                category
              </span>
              Score by Category
            </h3>
            <CategoryBarChart data={categoryScores} />
          </div>
        </div>
      )}

      {/* Quick Stats for Completed View */}
      {isCompleted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="mb-1 text-sm text-[var(--on-surface-variant)]">Total Queries</div>
            <div className="font-mono text-2xl font-bold text-[var(--on-surface)]">
              {totalCount}
            </div>
          </div>
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="mb-1 text-sm text-[var(--on-surface-variant)]">Pass Rate</div>
            <div className="font-mono text-2xl font-bold text-[var(--on-surface)]">
              {evaluation.results_summary?.pass_rate
                ? (evaluation.results_summary.pass_rate * 100).toFixed(1)
                : '0.0'}
              %
            </div>
          </div>
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <div className="mb-1 text-sm text-[var(--on-surface-variant)]">Avg Latency</div>
            <div className="font-mono text-2xl font-bold text-[var(--on-surface)]">
              {avgLatency}ms
            </div>
          </div>
        </div>
      )}

      {/* Results Table Card */}
      {(evaluation.results?.length || 0) > 0 && (
        <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--outline-variant)] px-6 py-4">
            <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
              {isRunning ? 'Live Results' : 'Query Results'}
            </h2>
            <div className="flex items-center gap-4">
              {/* Filter chips */}
              <div className="flex items-center gap-2">
                {(['all', 'pass', 'fail'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setResultFilter(filter)}
                    className={cn(
                      'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
                      resultFilter === filter
                        ? filter === 'pass'
                          ? 'bg-[var(--success)]/10 text-[var(--success-foreground)]'
                          : filter === 'fail'
                            ? 'bg-[var(--error)]/10 text-[var(--error-foreground)]'
                            : 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                    )}
                  >
                    {filter === 'all' ? 'All' : filter === 'pass' ? 'Passed' : 'Failed'}
                  </button>
                ))}
              </div>
              {isRunning && (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2',
                      isPolling
                        ? 'animate-pulse rounded-full bg-[var(--success)]'
                        : 'rounded-[2px] bg-[var(--outline)]'
                    )}
                  />
                  <span className="font-mono text-sm font-medium text-[var(--on-surface-variant)]">
                    {isPolling ? 'STREAMING' : 'PAUSED'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Query
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Agent Response
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Grader Reasoning
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Category
                  </th>
                  <th className="w-24 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Score
                  </th>
                  <th className="w-24 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {filteredResults.slice(0, 20).map((result, index) => (
                  <tr
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-[var(--surface-container-low)]',
                      index === 0 && isRunning && 'bg-[var(--primary)]/5'
                    )}
                  >
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm text-[var(--on-surface)]">
                      {result.query}
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm text-[var(--on-surface-variant)]">
                      {result.agent_response}
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-sm text-[var(--on-surface-variant)]">
                      {result.grader_reasoning}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-[4px] border px-2.5 py-0.5 text-xs font-medium',
                          getCategoryBadgeStyles(result.category)
                        )}
                      >
                        {formatCategory(result.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'font-mono text-sm font-bold',
                          getScoreColor(result.score * 100)
                        )}
                      >
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-xs font-semibold',
                          result.pass_fail === 'pass'
                            ? 'border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success-foreground)]'
                            : 'border-[var(--error)]/20 bg-[var(--error)]/10 text-[var(--error-foreground)]'
                        )}
                      >
                        {result.pass_fail === 'pass' ? (
                          <>
                            <span className="material-symbols-outlined text-sm">check</span>
                            PASS
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">close</span>
                            FAIL
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length > 20 && (
            <div className="border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-3 text-center">
              <button className="rounded-[4px] font-mono text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2">
                View all {filteredResults.length} results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state for no results yet */}
      {isRunning && (evaluation.results?.length || 0) === 0 && (
        <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-12 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-[var(--outline)]">
            hourglass_empty
          </span>
          <p className="text-[var(--on-surface-variant)]">Waiting for results...</p>
          <p className="mt-1 font-mono text-sm text-[var(--outline)]">{evaluation.progress}</p>
        </div>
      )}

      {/* Debug View Panel */}
      <DebugViewPanel
        result={convertToDebugFormat(selectedResult)}
        isOpen={selectedResult !== null}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
}
