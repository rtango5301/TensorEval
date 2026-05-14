'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { EvaluationWithResults } from '@/lib/api/types';
import { exportJson } from '@/lib/export/json';
import { exportMarkdown } from '@/lib/export/markdown';
import { exportCsv } from '@/lib/export/csv';
import { exportPdf } from '@/lib/export/pdf';

type Format = 'json' | 'markdown' | 'csv' | 'pdf';

interface EvaluationExportMenuProps {
  evaluation: EvaluationWithResults;
}

const FORMAT_OPTIONS: Array<{ id: Format; label: string; icon: string; description: string }> = [
  { id: 'pdf', label: 'PDF', icon: 'picture_as_pdf', description: 'Polished printable report' },
  { id: 'markdown', label: 'Markdown', icon: 'description', description: 'Plain-text for docs' },
  { id: 'csv', label: 'CSV', icon: 'table_view', description: 'Spreadsheet-friendly' },
  { id: 'json', label: 'JSON', icon: 'data_object', description: 'Structured raw data' },
];

export function EvaluationExportMenu({ evaluation }: EvaluationExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<Format | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleExport = async (format: Format) => {
    if (pendingFormat) return;
    setPendingFormat(format);
    try {
      if (format === 'json') exportJson(evaluation);
      else if (format === 'markdown') exportMarkdown(evaluation);
      else if (format === 'csv') exportCsv(evaluation);
      else if (format === 'pdf') await exportPdf(evaluation);
      setIsOpen(false);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setPendingFormat(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={pendingFormat !== null}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
          'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
          pendingFormat !== null && 'opacity-60 cursor-not-allowed'
        )}
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Export
        <span className="material-symbols-outlined text-base">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
        >
          {FORMAT_OPTIONS.map((option) => {
            const isPending = pendingFormat === option.id;
            return (
              <button
                key={option.id}
                role="menuitem"
                type="button"
                onClick={() => handleExport(option.id)}
                disabled={pendingFormat !== null}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-left transition-colors',
                  'hover:bg-slate-50',
                  pendingFormat !== null && !isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="material-symbols-outlined text-slate-500 text-xl">
                  {isPending ? 'progress_activity' : option.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-slate-900">
                    {option.label}
                    {isPending && ' — preparing…'}
                  </span>
                  <span className="block text-xs text-slate-500">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
