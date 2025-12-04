'use client';

import { useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ANALYTICS_CONSENT_EVENT,
  AnalyticsConsentState,
  getStoredConsent,
} from '@/app/lib/consent';
import { GA_ID, GTM_ID, isAnalyticsRuntimeEnabled, trackPageView } from '@/app/lib/analytics';
import { sanitizeForInnerHTML } from '@/app/lib/sanitize';

type AnalyticsProviderProps = {
  nonce?: string;
  enableAnalytics: boolean;
  gaTrackingId?: string;
  gtmId?: string;
};

export function AnalyticsProvider({
  nonce,
  enableAnalytics,
  gaTrackingId = GA_ID,
  gtmId = GTM_ID,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);

  const shouldEnable = isAnalyticsRuntimeEnabled() && enableAnalytics && (gaTrackingId || gtmId);

  useEffect(() => {
    if (!shouldEnable) return;

    const stored = getStoredConsent();
    setHasConsent(stored === 'accepted');

    const handleConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsentState>).detail;
      const accepted = detail === 'accepted';
      setHasConsent(accepted);

      if (!accepted && typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
  }, [shouldEnable]);

  const analyticsReady = shouldEnable && hasConsent;

  const pagePath = useMemo(() => {
    if (!pathname) return '/';
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!analyticsReady) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pushPageView = () => {
      const hasGtag = typeof window.gtag === 'function';
      const hasDataLayer = Array.isArray(window.dataLayer);

      if (!hasGtag && !hasDataLayer) {
        timeoutId = window.setTimeout(pushPageView, 50);
        return;
      }

      if (hasGtag) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }

      trackPageView(pagePath);
    };

    pushPageView();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [analyticsReady, pagePath]);

  if (!analyticsReady) return null;

  return (
    <>
      {gtmId ? (
        <Script
          id="gtm-base"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: sanitizeForInnerHTML(`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `),
          }}
        />
      ) : null}

      {gaTrackingId ? (
        <>
          <Script
            strategy="afterInteractive"
            nonce={nonce}
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
          />
          <Script
            id="gtag-base"
            strategy="afterInteractive"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: sanitizeForInnerHTML(`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  'analytics_storage': 'denied'
                });
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `),
            }}
          />
        </>
      ) : null}

      {gtmId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      ) : null}
    </>
  );
}
