'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Sort state type for external use
export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

interface SortableTableHeaderProps {
  /** Display label for the column header */
  label: string;
  /** Unique key used to identify which column is being sorted */
  sortKey: string;
  /** Current sort state - null means no column is sorted */
  currentSort: SortState | null;
  /** Callback fired when header is clicked with the sortKey */
  onSort: (key: string) => void;
  /** Additional class names to apply */
  className?: string;
}

/**
 * Arrow up icon (ascending sort indicator)
 * Using inline SVG to match Material Symbols style
 */
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 4l-8 8h5v8h6v-8h5z" />
    </svg>
  );
}

/**
 * Arrow down icon (descending sort indicator)
 * Using inline SVG to match Material Symbols style
 */
function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 20l8-8h-5V4h-6v8H4z" />
    </svg>
  );
}

/**
 * SortableTableHeader - A clickable table header cell with sort indicator
 *
 * Clicking toggles sort direction: first click sets descending, second sets ascending.
 * The sort icon appears to the right of the label and changes color when active.
 */
export function SortableTableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    onSort(sortKey);
  };

  // Determine aria-sort value for accessibility
  const ariaSort = isActive ? (direction === 'asc' ? 'ascending' : 'descending') : undefined;

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={ariaSort}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      className={cn(
        // Base styles matching existing th pattern
        'px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]',
        // Interactive styles
        'cursor-pointer select-none transition-colors',
        'hover:bg-[var(--surface-container-low)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-inset',
        // Group class enables group-hover on child elements (placeholder arrow)
        'group',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={cn(
            'inline-flex transition-colors',
            // Icon is muted when inactive, primary blue when active
            isActive ? 'text-[var(--primary)]' : 'text-[var(--outline)]'
          )}
        >
          {direction === 'asc' ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : direction === 'desc' ? (
            <ArrowDownIcon className="h-4 w-4" />
          ) : (
            // Show a subtle down arrow as placeholder when not sorted
            <ArrowDownIcon className="h-4 w-4 opacity-0 group-hover:opacity-50" />
          )}
        </span>
      </div>
    </th>
  );
}

export default SortableTableHeader;
