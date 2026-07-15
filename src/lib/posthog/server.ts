import 'server-only';

import { PostHog } from 'posthog-node';

/**
 * Server-side PostHog client (posthog-node).
 *
 * Configured for serverless/edge-adjacent runtimes: events are flushed
 * immediately rather than batched, since the process may be frozen right after
 * a request completes. `captureServer()` awaits the flush so events aren't lost.
 *
 * No-ops when NEXT_PUBLIC_POSTHOG_KEY is unset so local dev and CI (which have no
 * key) run unchanged — mirrors how Supabase auth degrades gracefully.
 */
let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export interface ServerCaptureOptions {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

/**
 * Capture a server-side event and flush it before returning.
 * Best-effort: never throws into the caller's auth flow.
 */
export async function captureServer({
  distinctId,
  event,
  properties,
}: ServerCaptureOptions): Promise<void> {
  const ph = getClient();
  if (!ph) return;

  try {
    ph.capture({
      distinctId,
      event,
      properties: {
        // Privacy-safe: never let PostHog derive geolocation from the request IP.
        $ip: null,
        ...properties,
      },
    });
    await ph.flush();
  } catch {
    // Telemetry must never break authentication.
  }
}
