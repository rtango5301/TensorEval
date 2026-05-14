import type { EvaluationWithResults, EvaluationResult } from '@/lib/api/types';
import { buildFilename, downloadBlob } from './download';

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function categoryRows(results: EvaluationResult[]): string[] {
  const buckets: Record<string, { total: number; count: number }> = {};
  for (const r of results) {
    if (!buckets[r.category]) buckets[r.category] = { total: 0, count: 0 };
    buckets[r.category].total += r.score * 100;
    buckets[r.category].count += 1;
  }
  return Object.entries(buckets)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(
      ([name, { total, count }]) =>
        `| ${formatCategory(name)} | ${(total / count).toFixed(1)}% | ${count} |`
    );
}

export function buildMarkdown(evaluation: EvaluationWithResults): string {
  const summary = evaluation.results_summary;
  const results = evaluation.results ?? [];
  const lines: string[] = [];

  lines.push(`# Evaluation Report: ${evaluation.name}`);
  lines.push('');
  lines.push(`- **Status**: ${evaluation.status}`);
  if (evaluation.dataset_name) lines.push(`- **Dataset**: ${evaluation.dataset_name}`);
  lines.push(`- **Created**: ${evaluation.created_at}`);
  if (evaluation.description) lines.push(`- **Description**: ${evaluation.description}`);
  lines.push('');

  if (summary) {
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Overall Score**: ${(summary.overall_score * 100).toFixed(1)}%`);
    lines.push(`- **Pass Rate**: ${(summary.pass_rate * 100).toFixed(1)}%`);
    lines.push(`- **Passed**: ${summary.passed_count} / ${summary.total_count}`);
    lines.push(`- **Failed**: ${summary.failed_count} / ${summary.total_count}`);
    lines.push(`- **Average Latency**: ${summary.avg_latency_ms}ms`);
    lines.push('');
  }

  if (results.length > 0) {
    lines.push('## Category Breakdown');
    lines.push('');
    lines.push('| Category | Average Score | Queries |');
    lines.push('| --- | --- | --- |');
    lines.push(...categoryRows(results));
    lines.push('');

    lines.push('## Results');
    lines.push('');
    results.forEach((r, i) => {
      const passLabel = r.pass_fail === 'pass' ? 'Pass' : 'Fail';
      const scorePct = (r.score * 100).toFixed(1);
      lines.push(`### ${i + 1}. ${escapeTableCell(r.query_id)} — ${passLabel} (${scorePct}%)`);
      lines.push('');
      lines.push(`- **Category**: ${formatCategory(r.category)}`);
      lines.push(`- **Latency**: ${r.latency_ms}ms`);
      lines.push('');
      lines.push('**Query**');
      lines.push('');
      lines.push('```');
      lines.push(r.query);
      lines.push('```');
      lines.push('');
      lines.push('**Agent Response**');
      lines.push('');
      lines.push('```');
      lines.push(r.agent_response);
      lines.push('```');
      lines.push('');
      lines.push('**Grader Reasoning**');
      lines.push('');
      lines.push(r.grader_reasoning);
      lines.push('');
    });
  }

  return lines.join('\n');
}

export function exportMarkdown(evaluation: EvaluationWithResults) {
  const content = buildMarkdown(evaluation);
  downloadBlob(content, buildFilename(evaluation.name, 'md'), 'text/markdown;charset=utf-8');
}
