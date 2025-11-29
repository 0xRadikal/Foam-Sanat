import Script from 'next/script';
import type { Locale } from '@/app/lib/i18n';
import { sanitizeForInnerHTML } from '@/app/lib/sanitize';

export type SupportedLocale = Locale;

export const renderResourceHints = () => null;

export const renderAnalyticsScripts = (
  gaTrackingId?: string,
  nonce?: string,
  gtmId?: string,
) => {
  if (!gaTrackingId && !gtmId) return null;

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
};
