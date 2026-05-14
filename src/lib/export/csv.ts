import type { EvaluationWithResults } from '@/lib/api/types';
import { buildFilename, downloadBlob } from './download';

function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCsv(evaluation: EvaluationWithResults) {
  const headers = [
    'Query ID',
    'Query',
    'Agent Response',
    'Reference Answer',
    'Category',
    'Score (%)',
    'Pass/Fail',
    'Latency (ms)',
    'Grader Reasoning',
  ];

  const rows = (evaluation.results ?? []).map((r) => [
    r.query_id,
    r.query,
    r.agent_response,
    r.reference_answer,
    r.category,
    (r.score * 100).toFixed(1),
    r.pass_fail,
    r.latency_ms,
    r.grader_reasoning,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

  // BOM ensures Excel reads UTF-8 correctly
  const content = '﻿' + csv;
  downloadBlob(content, buildFilename(evaluation.name, 'csv'), 'text/csv;charset=utf-8');
}
