'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

// Mock data for evaluation runs
const evaluationRuns = [
  {
    id: '1024',
    agentName: 'Support Bot v2.4',
    agentEmoji: '🤖',
    status: 'running' as const,
    startedAt: '4 min ago',
    duration: '--',
    passRate: 87.5,
    total: 50,
    completed: 32,
  },
  {
    id: '1023',
    agentName: 'Data Analyst',
    agentEmoji: '📊',
    status: 'completed' as const,
    startedAt: '2 hours ago',
    duration: '5m 23s',
    passRate: 92.0,
    total: 100,
    completed: 100,
  },
  {
    id: '1022',
    agentName: 'Content Writer',
    agentEmoji: '📝',
    status: 'failed' as const,
    startedAt: '5 hours ago',
    duration: '1m 12s',
    passRate: 45.0,
    total: 50,
    completed: 28,
  },
  {
    id: '1021',
    agentName: 'Code Reviewer',
    agentEmoji: '🔍',
    status: 'completed' as const,
    startedAt: '1 day ago',
    duration: '12m 45s',
    passRate: 98.5,
    total: 200,
    completed: 200,
  },
  {
    id: '1020',
    agentName: 'Translation Bot',
    agentEmoji: '🌐',
    status: 'completed' as const,
    startedAt: '1 day ago',
    duration: '3m 18s',
    passRate: 88.0,
    total: 75,
    completed: 75,
  },
  {
    id: '1019',
    agentName: 'Support Bot v2.3',
    agentEmoji: '🤖',
    status: 'failed' as const,
    startedAt: '2 days ago',
    duration: '2m 05s',
    passRate: 62.0,
    total: 50,
    completed: 50,
  },
  {
    id: '1018',
    agentName: 'Research Assistant',
    agentEmoji: '📚',
    status: 'completed' as const,
    startedAt: '3 days ago',
    duration: '8m 32s',
    passRate: 95.0,
    total: 80,
    completed: 80,
  },
  {
    id: '1017',
    agentName: 'Email Classifier',
    agentEmoji: '📧',
    status: 'running' as const,
    startedAt: '1 min ago',
    duration: '--',
    passRate: 0,
    total: 120,
    completed: 15,
  },
];

type StatusFilter = 'all' | 'running' | 'completed' | 'failed';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

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
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
  }
}

export default function EvaluationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredRuns = useMemo(() => {
    return evaluationRuns.filter((run) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        run.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.id.includes(searchQuery);

      // Filter by status
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--on-surface)]">
          Evaluation Runs
        </h1>
        <Link
          href="/evaluations/configure"
          className="flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Evaluation
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[var(--outline)]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by agent name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-2 pl-10 pr-4 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-[4px] px-3 py-1.5 text-sm font-medium transition-colors ${
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

      {/* Table */}
      <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Started
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Pass Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
                        search_off
                      </span>
                      <p className="text-sm text-[var(--on-surface-variant)]">
                        No evaluation runs found
                      </p>
                      <p className="text-xs text-[var(--outline)]">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="transition-colors hover:bg-[var(--surface-container-low)]"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[var(--on-surface-variant)]">
                        #{run.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{run.agentEmoji}</span>
                        <span className="text-sm font-medium text-[var(--on-surface)]">
                          {run.agentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyles(run.status)}`}
                      >
                        {run.status === 'running' && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                          </span>
                        )}
                        {getStatusLabel(run.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--on-surface-variant)]">
                        {run.startedAt}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[var(--on-surface-variant)]">
                        {run.duration}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {run.status === 'running' ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-sm text-[var(--outline)]">
                            {run.completed}/{run.total}
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-[4px] bg-[var(--surface-container)]">
                            <div
                              className="h-full rounded-[4px] bg-[var(--primary)] transition-all"
                              style={{ width: `${(run.completed / run.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`font-mono text-sm font-bold ${
                            run.passRate >= 80
                              ? 'text-[var(--success-foreground)]'
                              : run.passRate >= 60
                                ? 'text-[var(--warning-foreground)]'
                                : 'text-[var(--error-foreground)]'
                          }`}
                        >
                          {run.passRate.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/evaluations/${run.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                      >
                        View Details
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredRuns.length > 0 && (
        <div className="font-mono text-sm text-[var(--on-surface-variant)]">
          Showing {filteredRuns.length} of {evaluationRuns.length} evaluation runs
        </div>
      )}
    </div>
  );
}
