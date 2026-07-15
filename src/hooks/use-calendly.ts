'use client';

/**
 * useCalendly
 * Loads the Calendly popup widget assets (once per page) and returns an
 * `openCalendly` callback that opens the booking popup. Used by every
 * "Schedule a call" / demo CTA so the widget works on any route, not just
 * the landing page.
 */

import { useCallback, useEffect } from 'react';
import { CALENDLY_URL } from '@/lib/constants/contact';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

const CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';
const CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
const CSS_ID = 'calendly-widget-css';
const JS_ID = 'calendly-widget-js';

export function useCalendly() {
  // Inject Calendly assets on mount (idempotently — multiple consumers can
  // mount on the same page without double-injecting).
  useEffect(() => {
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement('link');
      link.id = CSS_ID;
      link.rel = 'stylesheet';
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }

    if (!document.getElementById(JS_ID) && !window.Calendly) {
      const script = document.createElement('script');
      script.id = JS_ID;
      script.src = CALENDLY_JS;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const openCalendly = useCallback(() => {
    window.Calendly?.initPopupWidget({ url: CALENDLY_URL });
  }, []);

  return { openCalendly };
}
