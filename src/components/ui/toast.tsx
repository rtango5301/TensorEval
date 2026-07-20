'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from './toast-context';

type ToastType = 'success' | 'info' | 'error';

// Icon and color configuration based on toast type
const toastConfig: Record<ToastType, { icon: string; iconColor: string; borderColor: string }> = {
  success: {
    icon: 'check_circle',
    iconColor: 'text-[var(--success)]',
    borderColor: 'border-[var(--success)]',
  },
  info: {
    icon: 'info',
    iconColor: 'text-[var(--primary)]',
    borderColor: 'border-[var(--primary)]',
  },
  error: {
    icon: 'error',
    iconColor: 'text-[var(--error)]',
    borderColor: 'border-[var(--error)]',
  },
};

export function Toast() {
  const { toast, hideToast } = useToast();
  const { message, type, isVisible } = toast;
  const config = toastConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed top-4 left-1/2 z-50 -translate-x-1/2',
            'flex items-center gap-3 px-4 py-3',
            'rounded-[8px] bg-white',
            'border-l-4',
            config.borderColor
          )}
          role="alert"
          aria-live="polite"
        >
          {/* Icon */}
          <span
            className={cn('material-symbols-rounded text-xl', config.iconColor)}
            aria-hidden="true"
          >
            {config.icon}
          </span>

          {/* Message */}
          <p className="pr-2 text-sm font-medium text-[var(--on-surface)]">{message}</p>

          {/* Dismiss button */}
          <button
            onClick={hideToast}
            className={cn(
              'flex items-center justify-center',
              'h-6 w-6 rounded-[4px]',
              'text-[var(--outline)] hover:text-[var(--on-surface-variant)]',
              'transition-colors hover:bg-[var(--surface-container-low)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]'
            )}
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-rounded text-lg" aria-hidden="true">
              close
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
