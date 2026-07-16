import 'server-only';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { captureServer } from '@/lib/posthog/server';
import { logger } from '@/lib/logger';

/**
 * Central instrumentation layer for authentication telemetry.
 *
 * Every auth touchpoint calls `logAuthEvent()`, which fans out to:
 *   1. PostHog (posthog-node)  — product analytics: funnels, dashboards, alerts.
 *   2. Supabase `auth_events`  — privacy-safe audit trail that also powers the
 *                                /admin dashboard and the brute-force throttle.
 *
 * Privacy-safe by construction: raw emails and full IPs never leave this module.
 * Everything here is best-effort — telemetry must never break the auth flow.
 */

// Mirrors the auth_event_type enum in the 20260711000000_add_auth_events migration.
export type AuthEventType =
  | 'sign_in_succeeded'
  | 'sign_in_failed'
  | 'sign_up_succeeded'
  | 'sign_up_failed'
  | 'oauth_initiated'
  | 'oauth_callback_succeeded'
  | 'oauth_callback_failed'
  | 'sign_out'
  | 'password_reset_requested'
  | 'password_updated'
  | 'login_blocked';

export type AuthProvider = 'email' | 'google';

// Brute-force protection thresholds.
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_MINUTES = 15;

export interface AuthEventContext {
  ip?: string | null;
  userAgent?: string | null;
}

export interface LogAuthEventParams extends AuthEventContext {
  event: AuthEventType;
  status: 'success' | 'failure';
  provider?: AuthProvider;
  reason?: string;
  userId?: string | null;
  /** Raw email — hashed before storage, never persisted or sent in the clear. */
  email?: string | null;
}

/** Hash an email with a server-side salt. sha256 hex fits auth_events.email_hash VARCHAR(64). */
export function hashEmail(email?: string | null): string | null {
  if (!email) return null;
  const salt = process.env.AUTH_EVENT_HASH_SALT || '';
  return createHash('sha256')
    .update(email.trim().toLowerCase() + salt)
    .digest('hex');
}

/** Reduce an IP to a coarse network prefix: /24 for IPv4, /48 for IPv6. Unknown → null. */
export function truncateIp(ip?: string | null): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();

  if (trimmed.includes(':')) {
    const hextets = trimmed.split(':').filter(Boolean);
    if (hextets.length < 3) return null;
    return `${hextets.slice(0, 3).join(':')}::/48`;
  }

  const octets = trimmed.split('.');
  if (octets.length === 4 && octets.every((o) => /^\d{1,3}$/.test(o))) {
    return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
  }

  return null;
}

/**
 * Read privacy-relevant request metadata from the current server-action / route
 * handler headers. Returns raw values; hashing/truncation happen in logAuthEvent.
 */
export async function getAuthRequestContext(): Promise<AuthEventContext> {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null;
    const userAgent = h.get('user-agent') || null;
    return { ip, userAgent };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/** Build the same context from a Request/Headers object (used by route handlers). */
export function contextFromHeaders(reqHeaders: Headers): AuthEventContext {
  const ip =
    reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || reqHeaders.get('x-real-ip') || null;
  const userAgent = reqHeaders.get('user-agent') || null;
  return { ip, userAgent };
}

/**
 * Record an auth event to PostHog and the auth_events audit table. Best-effort.
 */
export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
  const { event, status, provider, reason, userId, email, ip, userAgent } = params;

  const emailHash = hashEmail(email);
  const ipTruncated = truncateIp(ip);
  const distinctId = userId || emailHash || 'anonymous';

  // 1. PostHog analytics
  await captureServer({
    distinctId,
    event: `auth_${event}`,
    properties: {
      method: provider,
      status,
      reason,
    },
  });

  // 2. Supabase audit trail
  try {
    const admin = createAdminClient();
    if (admin) {
      const { error } = await admin.from('auth_events').insert({
        user_id: userId ?? null,
        event_type: event,
        provider: provider ?? null,
        status,
        reason: reason ?? null,
        email_hash: emailHash,
        ip_truncated: ipTruncated,
        user_agent: userAgent ?? null,
      });
      if (error) {
        logger.warn('telemetry/auth', 'Failed to insert auth_event', {
          event,
          dbError: error.message,
        });
      }
    }
  } catch (err) {
    logger.warn('telemetry/auth', 'auth_events insert threw', {
      event,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Brute-force check: is this (email, IP) currently rate-limited on failed sign-ins?
 *
 * Keyed on the (email_hash, ip_truncated) pair so users behind a shared NAT don't
 * lock each other out, at the cost of weaker protection against IP-rotating attacks.
 * Fails OPEN (returns false) when the audit DB is unavailable so an outage can't
 * lock everyone out.
 */
export async function checkLoginThrottle(
  email: string,
  ip?: string | null
): Promise<{ blocked: boolean; attempts: number }> {
  const admin = createAdminClient();
  if (!admin) return { blocked: false, attempts: 0 };

  const emailHash = hashEmail(email);
  const ipTruncated = truncateIp(ip);
  if (!emailHash) return { blocked: false, attempts: 0 };

  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString();

  try {
    let query = admin
      .from('auth_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'sign_in_failed')
      .eq('email_hash', emailHash)
      .gte('created_at', windowStart);

    // Match on the same coarse network the attempts came from.
    query = ipTruncated ? query.eq('ip_truncated', ipTruncated) : query.is('ip_truncated', null);

    const { count, error } = await query;
    if (error) {
      logger.warn('telemetry/auth', 'Throttle check failed', { dbError: error.message });
      return { blocked: false, attempts: 0 };
    }

    const attempts = count ?? 0;
    return { blocked: attempts >= MAX_LOGIN_ATTEMPTS, attempts };
  } catch (err) {
    logger.warn('telemetry/auth', 'Throttle check threw', {
      err: err instanceof Error ? err.message : String(err),
    });
    return { blocked: false, attempts: 0 };
  }
}
