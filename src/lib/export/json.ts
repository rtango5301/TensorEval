import type { EvaluationWithResults } from '@/lib/api/types';
import { buildFilename, downloadBlob } from './download';

export function exportJson(evaluation: EvaluationWithResults) {
  const content = JSON.stringify(evaluation, null, 2);
  downloadBlob(content, buildFilename(evaluation.name, 'json'), 'application/json');
}
