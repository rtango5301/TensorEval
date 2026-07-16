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
  return categoryColors[category] || 'bg-slate-100 text-slate-700 border-slate-200';
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
      <div className="text-sm text-slate-500 text-center py-4">No category data available</div>
    );
  }

  return (
    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
      {data.map((category) => (
        <div key={category.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-medium">{formatCategory(category.name)}</span>
            <span className={cn('font-bold', getScoreColor(category.score))}>
              {category.score.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute h-full rounded-full transition-all duration-500',
                getScoreBarColor(category.score)
              )}
              style={{ width: `${(category.score / maxScore) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{category.count} queries</p>
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
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
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
        <span className="text-4xl font-bold text-slate-900">{score.toFixed(1)}%</span>
        <span className="text-sm text-slate-500">Overall Score</span>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-64" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-64" />
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/evaluations" className="hover:text-[#135bec] transition-colors">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 font-medium">Error</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
          <p className="text-red-800 font-medium">{error.message}</p>
          <Link
            href="/evaluations"
            className="inline-block mt-4 text-sm text-red-600 hover:underline"
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/evaluations" className="hover:text-[#135bec] transition-colors">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 font-medium">Not Found</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
          <p className="text-slate-600">Evaluation not found</p>
          <Link
            href="/evaluations"
            className="inline-block mt-4 text-sm text-[#135bec] hover:underline"
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
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/evaluations" className="hover:text-[#135bec] transition-colors">
          Evaluations
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-slate-900 font-medium">Run #{id.slice(0, 8)}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{evaluation.name}</h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  isCompleted
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : isRunning
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                )}
              >
                {isRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
                {isCompleted ? 'Completed' : isRunning ? 'Running' : 'Failed'}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              {evaluation.dataset_name && (
                <>
                  Dataset:{' '}
                  <Link
                    href={`/datasets/${evaluation.dataset_id}`}
                    className="text-[#135bec] hover:underline"
                  >
                    {evaluation.dataset_name}
                  </Link>
                </>
              )}
              {evaluation.progress && isRunning && (
                <span className="ml-2">• {evaluation.progress}</span>
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
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Export
                  </button>
                  {showExportTooltip && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-10 shadow-lg">
                      Upgrade your membership
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  )}
                </div>
                <Link
                  href={`/evaluations/new?dataset=${evaluation.dataset_id}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#135bec] rounded-lg hover:bg-[#135bec]/90 transition-colors"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <div>
              <p className="text-sm font-medium text-red-800">Evaluation Failed</p>
              <p className="text-sm text-red-600">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Batch Progress</span>
              <span className="material-symbols-outlined text-[#135bec]">donut_large</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-500 mb-3">
              {completedCount} / {totalCount} Queries
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#135bec] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Passed Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Passed</span>
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-1">{passedCount}</div>
            <div className="text-sm text-slate-500">
              <span className="text-emerald-600 font-semibold">
                {completedCount > 0 ? ((passedCount / completedCount) * 100).toFixed(1) : '0.0'}%
              </span>{' '}
              Rate
            </div>
          </div>

          {/* Failed Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Failed</span>
              <span className="material-symbols-outlined text-red-500">cancel</span>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">{failedCount}</div>
            <div className="text-sm text-slate-500">
              <span className="text-red-600 font-semibold">
                {completedCount > 0 ? ((failedCount / completedCount) * 100).toFixed(1) : '0.0'}%
              </span>{' '}
              Rate
            </div>
          </div>

          {/* Avg Latency Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Avg Latency</span>
              <span className="material-symbols-outlined text-[#135bec]">speed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{avgLatency}ms</div>
            <div className="text-sm text-slate-500">Per query</div>
          </div>
        </div>
      )}

      {/* Completed View: Overall Score + Charts */}
      {isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
            <OverallScoreCircle score={overallScore} />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">{passedCount} Passed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500"></span>
                <span className="text-slate-600">{failedCount} Failed</span>
              </div>
            </div>
          </div>

          {/* Score by Category */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#135bec] text-lg">category</span>
              Score by Category
            </h3>
            <CategoryBarChart data={categoryScores} />
          </div>
        </div>
      )}

      {/* Quick Stats for Completed View */}
      {isCompleted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-sm text-slate-500 mb-1">Total Queries</div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-sm text-slate-500 mb-1">Pass Rate</div>
            <div className="text-2xl font-bold text-slate-900">
              {evaluation.results_summary?.pass_rate
                ? (evaluation.results_summary.pass_rate * 100).toFixed(1)
                : '0.0'}
              %
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-sm text-slate-500 mb-1">Avg Latency</div>
            <div className="text-2xl font-bold text-slate-900">{avgLatency}ms</div>
          </div>
        </div>
      )}

      {/* Results Table Card */}
      {(evaluation.results?.length || 0) > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
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
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      resultFilter === filter
                        ? filter === 'pass'
                          ? 'bg-emerald-100 text-emerald-700'
                          : filter === 'fail'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
                      'size-2 rounded-full',
                      isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    )}
                  />
                  <span className="text-sm font-medium text-slate-600">
                    {isPolling ? 'STREAMING' : 'PAUSED'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Agent Response
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Grader Reasoning
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                    Score
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.slice(0, 20).map((result, index) => (
                  <tr
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={cn(
                      'hover:bg-slate-50 transition-colors cursor-pointer',
                      index === 0 && isRunning && 'bg-blue-50/50'
                    )}
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-[200px] truncate">
                      {result.query}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                      {result.agent_response}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                      {result.grader_reasoning}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          getCategoryBadgeStyles(result.category)
                        )}
                      >
                        {formatCategory(result.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-sm font-bold', getScoreColor(result.score * 100))}>
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border',
                          result.pass_fail === 'pass'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
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
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-center">
              <button className="text-sm text-[#135bec] font-medium hover:underline">
                View all {filteredResults.length} results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state for no results yet */}
      {isRunning && (evaluation.results?.length || 0) === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
            hourglass_empty
          </span>
          <p className="text-slate-500">Waiting for results...</p>
          <p className="text-sm text-slate-400 mt-1">{evaluation.progress}</p>
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
