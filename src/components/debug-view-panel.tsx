'use client';

import { cn } from '@/lib/utils';
import { SlideOverPanel } from '@/components/ui/slide-over-panel';
import { Button } from '@/components/ui/button';

/**
 * EvaluationResult interface matching the structure from evaluations/[id]/page.tsx
 * Note: The interface in the requirements differs slightly from the actual page implementation.
 * This component supports both variations.
 */
interface EvaluationResult {
  id: number;
  query: string;
  expectedOutput: string; // Displayed as "Metric Reasoning"
  actualOutput: string; // Displayed as "Agent Response"
  latency: number;
  score: number;
  status: 'passed' | 'failed' | 'warning';
}

interface DebugViewPanelProps {
  /** The evaluation result to display */
  result: EvaluationResult | null;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when the panel should close */
  onClose: () => void;
}

/**
 * Status badge styling based on result status
 */
function getStatusStyles(status: EvaluationResult['status']) {
  switch (status) {
    case 'passed':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'PASSED',
        icon: 'check_circle',
      };
    case 'failed':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'FAILED',
        icon: 'cancel',
      };
    case 'warning':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'WARNING',
        icon: 'warning',
      };
    default:
      return {
        bg: 'bg-[var(--surface-container-low)]',
        text: 'text-[var(--on-surface-variant)]',
        border: 'border-[var(--outline-variant)]',
        label: 'UNKNOWN',
        icon: 'help',
      };
  }
}

/**
 * Get score color based on percentage value
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Get progress bar color based on score
 */
function getProgressBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * DebugViewPanel - Detailed view of a single evaluation result.
 *
 * Displays comprehensive information about an evaluation query including:
 * - Query ID and status badge
 * - Full query text
 * - Agent response (actualOutput)
 * - Metric reasoning (expectedOutput)
 * - Performance metrics (latency and score)
 */
export function DebugViewPanel({ result, isOpen, onClose }: DebugViewPanelProps) {
  // Early return if no result - panel still mounts for animation
  if (!result) {
    return (
      <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Debug View" width="lg">
        <div className="flex h-64 items-center justify-center text-[var(--on-surface-variant)]">
          No result selected
        </div>
      </SlideOverPanel>
    );
  }

  const statusStyles = getStatusStyles(result.status);

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Query #${result.id}`}
      description="Detailed evaluation result"
      width="lg"
    >
      <div className="flex flex-col">
        {/* Header with Status Badge */}
        <div className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">Status</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-xs font-semibold',
                  statusStyles.bg,
                  statusStyles.text,
                  statusStyles.border
                )}
              >
                <span className="material-symbols-outlined text-sm">{statusStyles.icon}</span>
                {statusStyles.label}
              </span>
            </div>
            <span className="font-mono text-sm text-[var(--outline)]">ID: {result.id}</span>
          </div>
        </div>

        {/* Query Section */}
        <div className="border-b border-[var(--outline-variant)] px-6 py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--on-surface)]">
            <span className="material-symbols-outlined text-lg text-[var(--primary)]">
              help_outline
            </span>
            Query
          </h3>
          <div className="rounded-[8px] bg-[var(--surface-container-low)] p-4">
            <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-[var(--on-surface-variant)]">
              {result.query}
            </p>
          </div>
        </div>

        {/* Agent Response Section */}
        <div className="border-b border-[var(--outline-variant)] px-6 py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--on-surface)]">
            <span className="material-symbols-outlined text-lg text-[var(--primary)]">
              smart_toy
            </span>
            Agent Response
          </h3>
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--on-surface-variant)]">
              {result.actualOutput}
            </p>
          </div>
        </div>

        {/* Metric Reasoning Section */}
        <div className="border-b border-[var(--outline-variant)] px-6 py-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--on-surface)]">
            <span className="material-symbols-outlined text-lg text-[var(--primary)]">
              psychology
            </span>
            Metric Reasoning
          </h3>
          <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--on-surface-variant)]">
              {result.expectedOutput}
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="border-b border-[var(--outline-variant)] px-6 py-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--on-surface)]">
            <span className="material-symbols-outlined text-lg text-[var(--primary)]">
              analytics
            </span>
            Metrics
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Latency Metric */}
            <div className="rounded-[8px] bg-[var(--surface-container-low)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Latency
                </span>
                <span className="material-symbols-outlined text-lg text-[var(--outline)]">
                  speed
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--on-surface)]">
                {result.latency}
                <span className="ml-1 text-sm font-normal text-[var(--on-surface-variant)]">
                  ms
                </span>
              </div>
            </div>

            {/* Score Metric */}
            <div className="rounded-[8px] bg-[var(--surface-container-low)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Score
                </span>
                <span className="material-symbols-outlined text-lg text-[var(--outline)]">
                  trending_up
                </span>
              </div>
              <div className={cn('text-2xl font-bold', getScoreColor(result.score))}>
                {result.score}
                <span className="ml-1 text-sm font-normal text-[var(--on-surface-variant)]">%</span>
              </div>
              {/* Visual Score Bar */}
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-[4px] bg-[var(--surface-container)]">
                  <div
                    className={cn(
                      'h-full rounded-[4px] transition-all duration-500 ease-out',
                      getProgressBarColor(result.score)
                    )}
                    style={{ width: `${Math.min(result.score, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-auto border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </SlideOverPanel>
  );
}

export type { EvaluationResult, DebugViewPanelProps };
