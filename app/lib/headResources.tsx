import Script from 'next/script';
import type { Locale } from '@/app/lib/i18n';
import { sanitizeForInnerHTML } from '@/app/lib/sanitize';

export type SupportedLocale = Locale;

export const renderResourceHints = () => null;

export const renderAnalyticsScripts = (
  gaTrackingId?: string,
  nonce?: string,
) => {
  if (!gaTrackingId) return null;

  return (
    <>
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: sanitizeForInnerHTML(`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied'
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
      <Script
        strategy="afterInteractive"
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
    </>
  );
};
