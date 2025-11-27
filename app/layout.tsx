// app/layout.tsx - Enhanced with SEO, Security, Manifest, and ENV Validation
import type { Metadata } from 'next';
import type React from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { AnalyticsManager } from '@/app/components/AnalyticsManager';
import { FontConsentController, FALLBACK_FONT_STACK } from '@/app/components/FontConsentController';
import { localeFontMap } from '@/app/lib/fonts';
import { isLocale, localeSettings } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';
import { renderResourceHints } from '@/app/lib/headResources';
import { SiteChromeProvider } from '@/app/lib/useSiteChrome';
import './globals.css';

import '@/app/lib/server-bootstrap';

export const metadata: Metadata = {
  metadataBase: new URL('https://foamsanat.com'),
  title: {
    default: 'فوم صنعت | ماشین‌آلات تزریق فوم پلی‌یورتان | Foam Sanat Industrial Group',
    template: '%s | فوم صنعت'
  },
  description: 'گروه صنعتی فوم صنعت - تولیدکننده پیشرو ماشین‌آلات تزریق فوم پلی‌یورتان با بیش از ۱۵ سال تجربه. گواهینامه ISO 9001:2015 و استاندارد CE اروپا.',
  keywords: [
    'ماشین تزریق فوم',
    'فوم پلی یورتان',
    'ماشین هایپرشر',
    'ماشین لوپرشر',
    'PU foam machinery',
    'polyurethane injection',
    'high-pressure foam machine',
    'low-pressure foam machine',
    'خط تولید فوم',
    'اتوماسیون صنعتی'
  ],
  authors: [{ name: 'Foam Sanat Industrial Group', url: 'https://foamsanat.com' }],
  creator: 'Foam Sanat Industrial Group',
  publisher: 'Foam Sanat Industrial Group',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'fa-IR': '/fa',
      'en-US': '/en'
    }
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
    url: 'https://foamsanat.com',
    title: 'فوم صنعت | ماشین‌آلات تزریق فوم پلی‌یورتان',
    description: 'تولیدکننده پیشرو ماشین‌آلات تزریق فوم پلی‌یورتان با بیش از ۱۵ سال تجربه',
    siteName: 'Foam Sanat',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Foam Sanat Industrial Group',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فوم صنعت | ماشین‌آلات تزریق فوم پلی‌یورتان',
    description: 'تولیدکننده پیشرو ماشین‌آلات تزریق فوم پلی‌یورتان',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#FF6700' },
    ],
  },
  manifest: '/site.webmanifest',
};

function resolveLayoutLocale(
  paramsLang: string | undefined,
  requestHeaders: Headers,
): keyof typeof localeSettings {
  const headerUrl =
    requestHeaders.get('x-url') ??
    requestHeaders.get('next-url') ??
    requestHeaders.get('referer') ??
    undefined;

  let langFromSearch: string | null = null;
  let langFromPath: string | null = null;

  if (headerUrl) {
    try {
      const parsed = new URL(headerUrl, 'https://placeholder.local');
      langFromSearch = parsed.searchParams.get('lang');

      const [maybeLang] = parsed.pathname.split('/').filter(Boolean);
      if (maybeLang && isLocale(maybeLang)) {
        langFromPath = maybeLang;
      }
    } catch {
      langFromSearch = null;
      langFromPath = null;
    }
  }

  return resolveLocale(paramsLang ?? langFromSearch ?? langFromPath ?? undefined);
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { lang?: string };
}) {
  const requestHeaders = headers();

  const runtimeLocale = resolveLayoutLocale(params?.lang, requestHeaders);
  const { dir, langTag } = localeSettings[runtimeLocale];
  const activeFont = localeFontMap[runtimeLocale];
  const bodyClassName = [activeFont.variable, 'antialiased'].filter(Boolean).join(' ');

  const bodyStyle: React.CSSProperties & Record<string, string> = {
    fontFamily: `var(--site-font-family, ${FALLBACK_FONT_STACK})`,
    '--site-font-family': FALLBACK_FONT_STACK,
  };

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const cspNonce = requestHeaders.get('x-csp-nonce') ?? undefined;
  const cspHeader = requestHeaders.get('content-security-policy') ?? undefined;
  const permissionsPolicy =
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()';
  const analyticsIdForLocale = localeSettings[runtimeLocale].analyticsEnabled ? GA_ID : undefined;

  return (
    <html
      lang={langTag}
      dir={dir}
      suppressHydrationWarning
      data-locale={runtimeLocale}
      data-lang-tag={langTag}
    >
      <head>
        {renderResourceHints()}

        {/* Theme Color */}
        <meta name="theme-color" content="#FF6700" />
        <meta name="msapplication-TileColor" content="#FF6700" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content={permissionsPolicy} />
        {cspHeader ? <meta httpEquiv="Content-Security-Policy" content={cspHeader} /> : null}
      </head>
      <body className={bodyClassName} suppressHydrationWarning style={bodyStyle}>
        <FontConsentController
          fontClassName={activeFont.className}
          fontFamily={activeFont.style.fontFamily}
        />
        <SiteChromeProvider initialLocale={runtimeLocale}>{children}</SiteChromeProvider>
        <AnalyticsManager
          gaTrackingId={analyticsIdForLocale}
          locale={runtimeLocale}
          nonce={cspNonce}
        />
        <Script
          id="hydration-fix"
          suppressHydrationWarning
          nonce={cspNonce}
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </body>
    </html>
  );
}