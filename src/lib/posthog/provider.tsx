'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useUser } from '@/contexts/user-context';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== 'undefined' && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    // Same-origin reverse proxy (see next.config.ts rewrites) to survive ad-blockers
    // and keep the CSP tight.
    api_host: '/ingest',
    // ui_host must be the app host (us.posthog.com), NOT the ingestion host (us.i.posthog.com),
    // so toolbar/dashboard links resolve instead of 404ing.
    ui_host: (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(
      '.i.posthog.com',
      '.posthog.com'
    ),
    // Privacy-safe: no anonymous person profiles, no autocaptured DOM, no IP/geo.
    person_profiles: 'identified_only',
    autocapture: false,
    disable_session_recording: true,
    ip: false,
    capture_pageview: false, // handled manually below so App Router navigations are tracked
  });
}

/**
 * Tracks client-side navigations as pageviews. Wrapped in Suspense because
 * useSearchParams() opts the subtree into client rendering.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    ph?.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // When no key is configured, render children untouched (telemetry disabled).
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/**
 * Associates the current PostHog distinct id with the authenticated Supabase user
 * so client funnels line up with the server-side auth events. Privacy-safe: sets
 * only the email domain as a person property, never the raw email. Mount inside a
 * UserProvider (i.e. the authenticated layout).
 */
export function PostHogIdentify() {
  const user = useUser();

  useEffect(() => {
    if (!POSTHOG_KEY || !user?.id) return;
    const emailDomain = user.email?.split('@')[1];
    posthog.identify(user.id, emailDomain ? { email_domain: emailDomain } : undefined);
  }, [user?.id, user?.email]);

  return null;
}
