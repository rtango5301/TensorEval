'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface ComingSoonBannerProps {
  show: boolean;
  onClose: () => void;
}

export function ComingSoonBanner({ show, onClose }: ComingSoonBannerProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="flex items-center gap-3 rounded-[8px] border border-[var(--primary)]/20 bg-white px-5 py-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] bg-[var(--surface-container)]">
              <Sparkles className="w-4.5 h-4.5 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--on-surface)]">Coming Soon</p>
              <p className="text-xs text-[var(--on-surface-variant)]">
                We&apos;re working hard to bring this to you. Stay tuned!
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-[4px] p-1.5 transition-colors hover:bg-[var(--surface-container-low)]"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-[var(--outline)]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
