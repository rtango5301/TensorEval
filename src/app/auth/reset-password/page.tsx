'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Check } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useState, useMemo, useTransition, useEffect } from 'react';
import { updatePassword } from '@/app/login/actions';
import { createClient } from '@/lib/supabase/client';

// Password validation rules
const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  {
    id: 'special',
    label: 'One number or symbol',
    test: (p: string) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid session (came from reset email link)
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      if (!supabase) {
        setIsValidSession(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsValidSession(!!user);
    };
    checkSession();
  }, []);

  // Check which password rules are satisfied
  const passwordValidation = useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      passed: rule.test(password),
    }));
  }, [password]);

  const allPasswordRulesPassed = passwordValidation.every((rule) => rule.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = allPasswordRulesPassed && passwordsMatch;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updatePassword(password);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success && typeof result.success === 'string') {
        setSuccess(result.success);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    });
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 lg:px-10">
        <div className="w-full max-w-[440px] rounded-[8px] border border-[var(--outline-variant)] bg-white p-8 text-center sm:p-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full mx-auto"
          />
          <p className="mt-4 text-[var(--text-secondary)]">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Invalid session - no valid reset token
  if (!isValidSession) {
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

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold">Invalid or Expired Link</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/login/forgot-password"
              className="inline-flex items-center justify-center rounded-[4px] bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
            >
              Request New Link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="mb-2 font-display text-2xl font-bold">Reset your password</h1>
          <p className="text-[var(--text-secondary)]">Enter your new password below.</p>
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

        {/* New Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || !!success}
              className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-3 pl-12 pr-12 text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[4px] p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="mb-4">
          <div className="space-y-2">
            {passwordValidation.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    rule.passed
                      ? 'bg-green-500'
                      : password.length > 0
                        ? 'bg-[var(--border)]'
                        : 'border border-[var(--border)] bg-transparent'
                  }`}
                >
                  {rule.passed && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    rule.passed ? 'text-green-600' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending || !!success}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isFormValid && !isPending) {
                  handleSubmit();
                }
              }}
              className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-3 pl-12 pr-12 text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[4px] p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Passwords match
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={isFormValid && !isPending && !success ? { scale: 1.01, y: -1 } : {}}
          whileTap={isFormValid && !isPending && !success ? { scale: 0.99 } : {}}
          onClick={handleSubmit}
          disabled={!isFormValid || isPending || !!success}
          className={`flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-3.5 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 ${
            isFormValid && !isPending && !success
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
              Updating password...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Password Updated
            </>
          ) : (
            'Reset Password'
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
