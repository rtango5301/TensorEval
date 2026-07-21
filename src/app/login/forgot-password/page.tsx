'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useState, useTransition } from 'react';
import { requestPasswordReset } from '../actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFormValid = email.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] rounded-[8px] border border-[var(--outline-variant)] bg-white p-8 sm:p-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center mb-8 justify-center">
          <Logo size="md" />
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2 font-display text-2xl font-bold">Forgot your password?</h1>
          <p className="text-[var(--text-secondary)]">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 rounded-[4px] border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isFormValid && !isPending) {
                  handleSubmit();
                }
              }}
              className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-3 pl-12 pr-4 text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={isFormValid && !isPending ? { scale: 1.01, y: -1 } : {}}
          whileTap={isFormValid && !isPending ? { scale: 0.99 } : {}}
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          className={`mb-6 flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-3.5 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 ${
            isFormValid && !isPending
              ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
              : 'cursor-not-allowed bg-[var(--surface-container-low)] text-[var(--outline)]'
          }`}
        >
          {isPending ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </motion.button>

        {/* Back to Login */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </motion.div>
    </div>
  );
}
