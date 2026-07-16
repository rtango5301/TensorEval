import type { EvaluationWithResults, EvaluationResult } from '@/lib/api/types';
import { buildFilename, downloadBlob } from './download';

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncate(value: string, max = 200): string {
  if (!value) return '';
  return value.length > max ? value.slice(0, max - 1) + '…' : value;
}

function categoryAverages(results: EvaluationResult[]): Array<[string, number, number]> {
  const buckets: Record<string, { total: number; count: number }> = {};
  for (const r of results) {
    if (!buckets[r.category]) buckets[r.category] = { total: 0, count: 0 };
    buckets[r.category].total += r.score * 100;
    buckets[r.category].count += 1;
  }
  return Object.entries(buckets)
    .map(([name, { total, count }]) => [name, total / count, count] as [string, number, number])
    .sort((a, b) => b[2] - a[2]);
}

export async function exportPdf(evaluation: EvaluationWithResults) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let cursorY = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Evaluation Report: ${evaluation.name}`, margin, cursorY);
  cursorY += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  const metaLines = [
    `Status: ${evaluation.status}`,
    evaluation.dataset_name ? `Dataset: ${evaluation.dataset_name}` : null,
    `Created: ${evaluation.created_at}`,
  ].filter(Boolean) as string[];
  metaLines.forEach((line) => {
    doc.text(line, margin, cursorY);
    cursorY += 14;
  });
  doc.setTextColor(0);
  cursorY += 8;

  const summary = evaluation.results_summary;
  if (summary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Summary', margin, cursorY);
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Score', `${(summary.overall_score * 100).toFixed(1)}%`],
        ['Pass Rate', `${(summary.pass_rate * 100).toFixed(1)}%`],
        ['Passed', `${summary.passed_count} / ${summary.total_count}`],
        ['Failed', `${summary.failed_count} / ${summary.total_count}`],
        ['Average Latency', `${summary.avg_latency_ms}ms`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [19, 91, 236] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  }

  const results = evaluation.results ?? [];
  if (results.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Category Breakdown', margin, cursorY);
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      head: [['Category', 'Average Score', 'Queries']],
      body: categoryAverages(results).map(([name, avg, count]) => [
        formatCategory(name),
        `${avg.toFixed(1)}%`,
        String(count),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [19, 91, 236] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Query Results', margin, cursorY);
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      head: [['#', 'Query', 'Response', 'Category', 'Score', 'Result']],
      body: results.map((r, i) => [
        String(i + 1),
        truncate(r.query, 140),
        truncate(r.agent_response, 160),
        formatCategory(r.category),
        `${(r.score * 100).toFixed(0)}%`,
        r.pass_fail.toUpperCase(),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [19, 91, 236] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: (pageWidth - margin * 2) * 0.32 },
        2: { cellWidth: (pageWidth - margin * 2) * 0.32 },
        3: { cellWidth: (pageWidth - margin * 2) * 0.14 },
        4: { cellWidth: (pageWidth - margin * 2) * 0.08 },
        5: { cellWidth: (pageWidth - margin * 2) * 0.1 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const value = String(data.cell.raw);
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = value === 'PASS' ? [22, 163, 74] : [220, 38, 38];
        }
      },
    });
  }

  const blob = doc.output('blob');
  downloadBlob(blob, buildFilename(evaluation.name, 'pdf'), 'application/pdf');
}
