'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { logAuthEvent, checkLoginThrottle, getAuthRequestContext } from '@/lib/telemetry/auth';

import { z } from 'zod';

const SUPABASE_NOT_CONFIGURED_ERROR =
  'Authentication is not configured. Please set up Supabase credentials.';

const signInSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9!@#$%^&*]/, 'Password must contain a number or symbol'),
  fullName: z.string().min(1).max(100).optional(),
});

const ALLOWED_PROVIDERS = ['google'] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

/**
 * Create a Supabase client with explicit cookie handling (no try-catch).
 * Used by signInWithEmail and signInWithOAuth where cookies MUST be written
 * (session cookies and PKCE code verifier respectively).
 */
async function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

async function getOrigin() {
  // NEXT_PUBLIC_SITE_URL should always be set in production to avoid
  // relying on host headers which can be spoofed.
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

    if (process.env.NODE_ENV === 'production') {
      if (siteUrl.includes('localhost')) {
        console.warn('[auth] NEXT_PUBLIC_SITE_URL contains "localhost" in production:', siteUrl);
      }
      if (siteUrl.startsWith('http://')) {
        console.warn('[auth] NEXT_PUBLIC_SITE_URL uses http:// in production:', siteUrl);
      }
    }

    return siteUrl;
  }

  // Fallback: construct from host headers (needed for local dev)
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[auth] NEXT_PUBLIC_SITE_URL is not set in production — falling back to request headers'
    );
  }
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0].trim();
  return `${proto}://${host}`;
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createAuthClient();

  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ctx = await getAuthRequestContext();

  // Brute-force protection: block after too many recent failures for this (email, network).
  const throttle = await checkLoginThrottle(parsed.data.email, ctx.ip);
  if (throttle.blocked) {
    await logAuthEvent({
      event: 'login_blocked',
      status: 'failure',
      provider: 'email',
      reason: 'too_many_attempts',
      email: parsed.data.email,
      ...ctx,
    });
    return { error: 'Too many failed attempts. Please try again in a few minutes.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    await logAuthEvent({
      event: 'sign_in_failed',
      status: 'failure',
      provider: 'email',
      reason: error.message.includes('Invalid login credentials') ? 'invalid_credentials' : 'error',
      email: parsed.data.email,
      ...ctx,
    });
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  await logAuthEvent({
    event: 'sign_in_succeeded',
    status: 'success',
    provider: 'email',
    userId: data.user?.id ?? null,
    email: parsed.data.email,
    ...ctx,
  });

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const origin = await getOrigin();
  const ctx = await getAuthRequestContext();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    await logAuthEvent({
      event: 'sign_up_failed',
      status: 'failure',
      provider: 'email',
      reason: error.message.includes('User already registered') ? 'already_registered' : 'error',
      email: parsed.data.email,
      ...ctx,
    });
    if (error.message.includes('User already registered')) {
      return { error: 'An account with this email already exists.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  await logAuthEvent({
    event: 'sign_up_succeeded',
    status: 'success',
    provider: 'email',
    userId: data.user?.id ?? null,
    email: parsed.data.email,
    ...ctx,
  });

  return { success: 'Check your email to confirm your account' };
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  if (!ALLOWED_PROVIDERS.includes(provider as AllowedProvider)) {
    return { error: 'Unsupported authentication provider' };
  }

  const supabase = await createAuthClient();

  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  await logAuthEvent({
    event: 'oauth_initiated',
    status: 'success',
    provider: 'google',
    ...(await getAuthRequestContext()),
  });

  return { url: data.url };
}

export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.signOut({ scope: 'global' });
    await logAuthEvent({
      event: 'sign_out',
      status: 'success',
      userId: user?.id ?? null,
      email: user?.email ?? null,
      ...(await getAuthRequestContext()),
    });
  }
  revalidatePath('/', 'layout');
  // Don't redirect here - let client handle navigation with router.refresh()
  // to ensure Next.js Router Cache is properly cleared
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  await logAuthEvent({
    event: 'password_reset_requested',
    status: error ? 'failure' : 'success',
    provider: 'email',
    reason: error ? 'error' : undefined,
    email,
    ...(await getAuthRequestContext()),
  });

  if (error && error.message.includes('rate limit')) {
    return { error: 'Too many requests. Please try again later.' };
  }

  // Always return success to prevent email enumeration
  return {
    success: 'If an account exists with this email, you will receive a password reset link.',
  };
}

export async function updatePassword(newPassword: string) {
  const passwordSchema = z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9!@#$%^&*]/, 'Must contain a number or symbol');
  const result = passwordSchema.safeParse(newPassword);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_ERROR };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    await logAuthEvent({
      event: 'password_updated',
      status: 'failure',
      userId: user?.id ?? null,
      reason: 'error',
      ...(await getAuthRequestContext()),
    });
    return { success: false, error: 'Failed to update password. Please try again.' };
  }

  await logAuthEvent({
    event: 'password_updated',
    status: 'success',
    userId: user?.id ?? null,
    email: user?.email ?? null,
    ...(await getAuthRequestContext()),
  });

  return { success: 'Password updated successfully! Redirecting to dashboard...' };
}
