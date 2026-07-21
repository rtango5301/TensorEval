'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface WaitlistDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WaitlistDialog({ open, onClose }: WaitlistDialogProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog reopens
  useEffect(() => {
    if (open) {
      setEmail('');
      setSubmitted(false);
      // Focus the input after animation
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // TODO: Wire up to Supabase or an API endpoint to store waitlist emails
    setSubmitted(true);

    // Auto-close after showing success
    setTimeout(onClose, 2500);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="relative w-full max-w-[420px] rounded-[8px] border border-[var(--outline-variant)] bg-white p-6 shadow-xl sm:p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-[4px] p-1.5 transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--surface-container)]">
                      <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                    </div>

                    <h3 className="mb-2 font-display text-xl font-bold text-[var(--foreground)]">
                      Join the Waitlist
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">
                      Coming soon — share your email and we&apos;ll keep you posted.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        ref={inputRef}
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-[4px] bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                      >
                        Join Waitlist
                      </button>
                    </form>

                    <p className="text-xs text-[var(--text-muted)] mt-4">
                      We&apos;ll never share your email.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-center py-4"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-bold text-[var(--foreground)]">
                      You&apos;re on the list!
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      We&apos;ll reach out when it&apos;s ready.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
