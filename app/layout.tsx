// app/layout.tsx - Enhanced with SEO, Security, Manifest
import type { Metadata } from 'next';
import Script from 'next/script';
import { defaultLocale, localeSettings } from '@/app/lib/i18n';
import './globals.css';

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

const defaultLang = defaultLocale;
const defaultLocaleConfig = localeSettings[defaultLang];
const shouldLoadVazirmatn = defaultLang === 'fa';
const defaultBodyFont = shouldLoadVazirmatn
  ? 'Vazirmatn, system-ui, sans-serif'
  : 'system-ui, sans-serif';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={defaultLang} dir={defaultLocaleConfig.dir} suppressHydrationWarning>
      <head>
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

        {/* Theme Color */}
        <meta name="theme-color" content="#FF6700" />
        <meta name="msapplication-TileColor" content="#FF6700" />

        {/* Google Analytics with Consent Mode */}
        {GA_ID && (
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
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                    anonymize_ip: true,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `,
              }}
            />
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
          </>
        )}
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
        style={{ fontFamily: defaultBodyFont }}
      >
        {children}
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