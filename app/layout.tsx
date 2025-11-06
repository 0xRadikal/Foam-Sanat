import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://foamsanat.com'),
  title: {
    default: 'Foam Sanat Industrial Group | PU Foam Injection Machinery',
    template: '%s | Foam Sanat'
  },
  description: 'Leading manufacturer of polyurethane foam injection machinery. 15+ years expertise, ISO 9001 certified, CE compliant.',
  keywords: ['PU foam machinery', 'polyurethane injection', 'high-pressure foam', 'low-pressure foam'],
  authors: [{ name: 'Foam Sanat Industrial Group' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'fa-IR': '/fa',
      'en-US': '/en'
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}