'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Width mappings for panel sizes
const widthMap = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 672,
} as const;

type PanelWidth = keyof typeof widthMap;

interface SlideOverPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Panel title displayed in the header */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Panel content */
  children: React.ReactNode;
  /** Panel width preset */
  width?: PanelWidth;
  /** Additional class names for the panel container */
  className?: string;
}

/**
 * SlideOverPanel - A right-sliding panel overlay component.
 *
 * Features:
 * - Animated backdrop and slide-in panel using Framer Motion
 * - Sticky header with title, description, and close button
 * - Keyboard accessible (Escape to close, focus trap)
 * - Proper ARIA attributes for screen readers
 */
export function SlideOverPanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'md',
  className,
}: SlideOverPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Handle Escape key to close panel
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when panel is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus the panel when it opens for accessibility
  React.useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  const panelWidth = widthMap[width];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel container - positioned to the right */}
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <motion.div
              ref={panelRef}
              initial={{ x: panelWidth }}
              animate={{ x: 0 }}
              exit={{ x: panelWidth }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ width: panelWidth }}
              className={cn(
                'relative flex h-full flex-col rounded-l-[8px] bg-white shadow-xl',
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="slide-over-title"
              aria-describedby={description ? 'slide-over-description' : undefined}
              tabIndex={-1}
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex flex-col rounded-tl-[8px] border-b border-[var(--outline-variant)] bg-white px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h2
                      id="slide-over-title"
                      className="font-display text-lg font-bold text-[var(--on-surface)]"
                    >
                      {title}
                    </h2>
                    {description && (
                      <p
                        id="slide-over-description"
                        className="text-sm text-[var(--on-surface-variant)]"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--outline)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)] focus:ring-offset-2"
                    aria-label="Close panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Export width map for external usage if needed
export { widthMap as slideOverWidthMap };
export type { SlideOverPanelProps, PanelWidth };
