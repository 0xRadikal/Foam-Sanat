import { NextResponse, type NextRequest } from 'next/server';

import '@/app/lib/server-bootstrap';

const isDev = process.env.NODE_ENV === 'development';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildContentSecurityPolicy(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://challenges.cloudflare.com',
  ];

  if (isDev) {
    // Allow React Fast Refresh / webpack dev runtime to use eval locally.
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://challenges.cloudflare.com',
  ];

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ];

  const frameSrc = ["'self'", 'https://challenges.cloudflare.com'];

  const styleSrc = ["'self'", "'unsafe-inline'"];

  const fontSrc = ["'self'", 'data:'];

  return [
    "default-src 'self';",
    `script-src ${scriptSrc.join(' ')};`,
    `style-src ${styleSrc.join(' ')};`,
    `img-src ${imgSrc.join(' ')};`,
    `font-src ${fontSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "frame-ancestors 'self';",
    'upgrade-insecure-requests;',
  ].join(' ');
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-csp-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy(nonce));
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}
