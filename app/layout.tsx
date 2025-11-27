// app/layout.tsx - Enhanced with SEO, Security, Manifest, and ENV Validation
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { isLocale, localeSettings } from '@/app/lib/i18n';
import { resolveLocale } from '@/app/lib/locale';
import { renderAnalyticsScripts, renderResourceHints } from '@/app/lib/headResources';
import { SiteChromeProvider } from '@/app/lib/useSiteChrome';
import './globals.css';

// ✅ FIX #8: Import and run environment validation
import { validateEnv } from '@/app/lib/env';

// Validate environment variables only during server rendering to fail fast on misconfiguration
if (typeof window === 'undefined') {
  validateEnv();
}

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

function resolveLayoutLocale(paramsLang?: string): keyof typeof localeSettings {
  const requestHeaders = headers();

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
  const runtimeLocale = resolveLayoutLocale(params?.lang);
  const { dir, langTag } = localeSettings[runtimeLocale];
  const shouldLoadVazirmatn = runtimeLocale === 'fa';
  const defaultBodyFont = shouldLoadVazirmatn
    ? 'Vazirmatn, system-ui, sans-serif'
    : 'system-ui, sans-serif';

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const bodyStyle: CSSProperties & Record<'--site-font-family', string> = {
    fontFamily: `var(--site-font-family, ${defaultBodyFont})`,
    '--site-font-family': defaultBodyFont,
  };

  return (
    <html lang={langTag} dir={dir} suppressHydrationWarning>
      <head>
        {renderResourceHints(runtimeLocale)}

        {/* Theme Color */}
        <meta name="theme-color" content="#FF6700" />
        <meta name="msapplication-TileColor" content="#FF6700" />

        {/* Google Analytics with Consent Mode */}
        {renderAnalyticsScripts(GA_ID)}
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
        style={bodyStyle}
      >
        <SiteChromeProvider initialLocale={runtimeLocale}>{children}</SiteChromeProvider>
        <Script
          id="hydration-fix"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </body>
    </html>
  );
}