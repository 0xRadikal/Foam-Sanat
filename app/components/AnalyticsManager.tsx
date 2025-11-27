'use client';

import { useEffect, useState } from 'react';
import { renderAnalyticsScripts, type SupportedLocale } from '@/app/lib/headResources';
import {
  ANALYTICS_CONSENT_EVENT,
  AnalyticsConsentState,
  getStoredConsent,
} from '@/app/lib/consent';
import { localeSettings } from '@/app/lib/i18n';

function useAnalyticsConsent(locale: SupportedLocale, enabled: boolean) {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const stored = getStoredConsent();
    setShouldLoadAnalytics(stored === 'accepted');

    const handleConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsentState>).detail;
      setShouldLoadAnalytics(detail === 'accepted');

      if (detail === 'declined' && typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
  }, [enabled, locale]);

  return shouldLoadAnalytics;
}

export function AnalyticsManager({
  gaTrackingId,
  locale,
  nonce,
}: {
  gaTrackingId?: string;
  locale: SupportedLocale;
  nonce?: string;
}) {
  const localeAllowsAnalytics = localeSettings[locale].analyticsEnabled;
  const shouldLoadAnalytics = useAnalyticsConsent(locale, localeAllowsAnalytics);

  if (!shouldLoadAnalytics || !gaTrackingId || !localeAllowsAnalytics) return null;

  return renderAnalyticsScripts(gaTrackingId, nonce);
}
