import Script from 'next/script';
import { localeSettings } from '@/app/lib/i18n';

export type SupportedLocale = keyof typeof localeSettings;

export const renderResourceHints = (locale: SupportedLocale) => {
  const shouldLoadVazirmatn = locale === 'fa';

  return (
    <>
      {/* Preconnect to external resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

      {/* Vazirmatn Font - Persian */}
      {shouldLoadVazirmatn && (
        <link
          href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
      )}
    </>
  );
};

export const renderAnalyticsScripts = (gaTrackingId?: string) => {
  if (!gaTrackingId) return null;

  return (
    <>
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Default consent to denied
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 500
            });

            gtag('js', new Date());
            gtag('config', '${gaTrackingId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
    </>
  );
};
