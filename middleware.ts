import { NextResponse, type NextRequest } from 'next/server';

import '@/app/lib/server-bootstrap';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// CSP is enforced via HTTP headers (never via <meta http-equiv>) to ensure the
// policy cannot be bypassed by markup. Update the allowlists below when adding
// new script or iframe providers.
function buildContentSecurityPolicy(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Next.js uses eval-based tooling in development. Adding 'unsafe-eval'
    // here prevents CSP violations when running the dev server while keeping
    // production as strict as possible.
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://challenges.cloudflare.com',
  ];

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

  const frameSrc = [
    "'self'",
    // Cloudflare Turnstile challenge iframe
    'https://challenges.cloudflare.com',
    // Google Maps embeds used in ContactSection map URL
    'https://maps.app.goo.gl',
    'https://www.google.com',
    'https://maps.google.com',
    'https://maps.googleapis.com',
  ];

  // Restrict which origins can frame this site. Expand only if there is a
  // demonstrated embedding requirement.
  const frameAncestors = ["'self'"];

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
    `frame-ancestors ${frameAncestors.join(' ')};`,
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
