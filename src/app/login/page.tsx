'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  GitBranch,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { useState, useMemo, useTransition, Suspense } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithOAuth } from './actions';

type AuthMode = 'signin' | 'signup';

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

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 lg:px-10">
      <div className="grid min-h-[680px] w-full max-w-[1100px] animate-pulse grid-cols-4 overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white lg:grid-cols-12">
        <div className="col-span-4 bg-[var(--inverse-surface)] p-10 lg:col-span-5 lg:p-14" />
        <div className="col-span-4 p-10 lg:col-span-7 lg:p-12" />
      </div>
    </div>
  );
}

function AuthPageContent() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Check for auth error in URL
  const urlError = searchParams.get('error');

  // Check which password rules are satisfied
  const passwordValidation = useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      passed: rule.test(password),
    }));
  }, [password]);

  const allPasswordRulesPassed = passwordValidation.every((rule) => rule.passed);

  // Form validation based on mode
  const isFormValid =
    mode === 'signin'
      ? email.trim() !== '' && password.trim() !== ''
      : fullName.trim() !== '' && email.trim() !== '' && allPasswordRulesPassed;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (mode === 'signup') {
      formData.append('fullName', fullName);
    }

    startTransition(async () => {
      if (mode === 'signin') {
        const result = await signInWithEmail(formData);
        if (result?.error) {
          setError(result.error);
        }
      } else {
        const result = await signUpWithEmail(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setSuccess(result.success);
        }
      }
    });
  };

  const handleOAuth = (provider: 'google') => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithOAuth(provider);
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    });
  };

  // Reset form when switching modes
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setFullName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid min-h-[680px] w-full max-w-[1100px] grid-cols-4 overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white lg:grid-cols-12"
      >
        {/* Left Side - Branding */}
        <div className="col-span-4 flex flex-col justify-center bg-[var(--inverse-surface)] p-10 text-[var(--inverse-on-surface)] lg:col-span-5 lg:p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-10">
            <Logo variant="light" size="md" className="lg:hidden" />
            <span className="hidden rounded-[8px] bg-white p-3 lg:block">
              <Logo lockup size="md" />
            </span>
          </Link>

          {/* Heading */}
          <h1 className="mb-5 font-display text-4xl font-extrabold leading-[1.2] tracking-tight text-[var(--inverse-on-surface)] lg:text-[2.75rem]">
            Ship AI Agents
            <br />
            with{' '}
            <span className="inline-block pr-2 italic text-[var(--inverse-on-surface)]">
              Confidence
            </span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-[var(--inverse-on-surface)]/70">
            Ship agent improvements in hours, not weeks. Automated evals. Instant feedback.{' '}
            <span className="whitespace-nowrap font-semibold text-[var(--inverse-on-surface)]">
              Zero guesswork.
            </span>
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: GitBranch, title: 'Eval pipelines on every commit' },
              { icon: Users, title: 'Realistic, behavior-driven test cases' },
              { icon: BarChart3, title: 'Multi-metric scoring & A/B comparisons' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] bg-white/10">
                  <feature.icon className="h-4 w-4 text-[var(--brand-highlight)]" />
                </div>
                <span className="text-[0.95rem] font-semibold text-[var(--inverse-on-surface)]">
                  {feature.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="col-span-4 flex flex-col justify-center bg-white p-8 sm:p-10 lg:col-span-7 lg:p-12">
          <div className="max-w-[380px] mx-auto w-full">
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-8">
                <button
                  onClick={() => handleModeChange('signin')}
                  className={`relative rounded-[4px] pb-2 text-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 ${
                    mode === 'signin'
                      ? 'text-slate-900 border-b-2 border-[var(--primary)]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleModeChange('signup')}
                  className={`relative rounded-[4px] pb-2 text-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 ${
                    mode === 'signup'
                      ? 'text-slate-900 border-b-2 border-[var(--primary)]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="mb-2 font-display text-3xl font-bold">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-[var(--text-secondary)]">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your dashboard'
                    : 'Join thousands of AI teams shipping agents with confidence'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {(error || urlError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {/* Strict equality prevents reflecting arbitrary URL params — do not change to {urlError} */}
                      {error ||
                        (urlError === 'auth_failed' && 'Authentication failed. Please try again.')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-2 rounded-[4px] border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOAuth('google')}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-3 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Full Name Input - Only for Sign Up */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isPending}
                      className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-3 pl-12 pr-4 text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20 disabled:opacity-50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {mode === 'signin' ? 'Email Address' : 'Work Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-3 pl-12 pr-4 text-[var(--foreground)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={mode === 'signin' ? 'mb-6' : 'mb-4'}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Password
                </label>
                {mode === 'signin' && (
                  <Link
                    href="/login/forgot-password"
                    className="text-sm text-[var(--primary)] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isFormValid && !isPending) {
                      handleSubmit();
                    }
                  }}
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

            {/* Password Requirements - Only for Sign Up */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {passwordValidation.map((rule) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
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
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <span className="ml-1">→</span>
                </>
              )}
            </motion.button>

            {/* Terms */}
            <p className="text-center text-xs text-[var(--text-muted)] mt-6">
              By continuing, you agree to our{' '}
              <Link href="#" className="underline hover:text-[var(--foreground)]">
                Terms
              </Link>{' '}
              &{' '}
              <Link href="#" className="underline hover:text-[var(--foreground)]">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
