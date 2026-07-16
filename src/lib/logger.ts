/**
 * Minimal structured logger.
 *
 * Replaces scattered `console.*` calls with leveled, JSON-friendly output and
 * automatic redaction of sensitive fields. Safe to import in any runtime
 * (server, edge middleware, client) — it only wraps the console.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.warn('auth/callback', 'Code exchange failed', { code, redirectOrigin });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Field names whose values must never be logged in the clear.
const REDACTED_KEYS = [
  'password',
  'email',
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'authorization',
  'ip',
  'secret',
];

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (REDACTED_KEYS.includes(key.toLowerCase())) {
        out[key] = '[redacted]';
      } else {
        out[key] = redact(val, depth + 1);
      }
    }
    return out;
  }

  return value;
}

function emit(level: LogLevel, scope: string, message: string, context?: Record<string, unknown>) {
  const payload = {
    level,
    scope,
    message,
    ...(context ? { context: redact(context) } : {}),
  };

  const line = JSON.stringify(payload);

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug: (scope: string, message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') emit('debug', scope, message, context);
  },
  info: (scope: string, message: string, context?: Record<string, unknown>) =>
    emit('info', scope, message, context),
  warn: (scope: string, message: string, context?: Record<string, unknown>) =>
    emit('warn', scope, message, context),
  error: (scope: string, message: string, context?: Record<string, unknown>) =>
    emit('error', scope, message, context),
};
