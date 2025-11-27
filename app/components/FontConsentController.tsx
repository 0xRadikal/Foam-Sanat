'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ANALYTICS_CONSENT_EVENT,
  type AnalyticsConsentState,
  getStoredConsent,
} from '@/app/lib/consent';

const FALLBACK_FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

type FontConsentControllerProps = {
  fontClassName: string;
  fontFamily: string;
};

function useFontConsent(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setAllowed(stored === 'accepted');

    const handleConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsentState>).detail;
      setAllowed(detail === 'accepted');
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
  }, []);

  return allowed;
}

export function FontConsentController({ fontClassName, fontFamily }: FontConsentControllerProps) {
  const allowFonts = useFontConsent();
  const resolvedFontFamily = useMemo(
    () => (allowFonts ? fontFamily : FALLBACK_FONT_STACK),
    [allowFonts, fontFamily],
  );

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.dataset.fonts = allowFonts ? 'allowed' : 'denied';
    root.style.setProperty('--site-font-family', resolvedFontFamily);

    if (allowFonts) {
      body.classList.add(fontClassName);
    } else {
      body.classList.remove(fontClassName);
    }
  }, [allowFonts, fontClassName, resolvedFontFamily]);

  return null;
}

export { FALLBACK_FONT_STACK };
