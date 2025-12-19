import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import '@/app/lib/server-bootstrap';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildContentSecurityPolicy(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
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
    'https://challenges.cloudflare.com',
    'https://maps.app.goo.gl',
    'https://www.google.com',
    'https://maps.google.com',
    'https://maps.googleapis.com',
  ];

  const frameAncestors = ["'self'"];

  const styleSrc = isDevelopment
    ? [
        "'self'",
        "'unsafe-inline'",
      ]
    : [
        "'self'",
        `'nonce-${nonce}'`,
      ];

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

function setSecurityHeaders(response: NextResponse, nonce: string) {
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy(nonce));
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
}

async function ensureAdminAuth(request: NextRequest): Promise<{ token: Awaited<ReturnType<typeof getToken>> | null; redirect?: NextResponse }> {
  const pathname = request.nextUrl.pathname;
  const requiresAuth =
    (pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/api/admin');

  if (!requiresAuth) {
    return { token: null };
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return { token: null, redirect: NextResponse.redirect(loginUrl) };
  }

  if ((pathname.startsWith('/admin/admins') || pathname.startsWith('/api/admin/admins')) && token.role !== 'SUPERADMIN') {
    const root = new URL('/admin', request.url);
    return { token, redirect: NextResponse.redirect(root) };
  }

  return { token };
}

export async function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  requestHeaders.set('x-csp-nonce', nonce);

  const authResult = await ensureAdminAuth(request);
  if (authResult.redirect) {
    setSecurityHeaders(authResult.redirect, nonce);
    return authResult.redirect;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isAdminContext =
    (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') ||
    request.nextUrl.pathname.startsWith('/api/admin');

  if (isAdminContext) {
    const existingCsrf = request.cookies.get('admin-csrf')?.value ?? crypto.randomUUID();
    response.cookies.set({
      name: 'admin-csrf',
      value: existingCsrf,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    if (request.nextUrl.pathname.startsWith('/api/admin') && request.method !== 'GET') {
      const headerToken = request.headers.get('x-csrf-token');
      if (!headerToken || headerToken !== existingCsrf) {
        const forbidden = NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
        setSecurityHeaders(forbidden, nonce);
        return forbidden;
      }
    }
  }

  setSecurityHeaders(response, nonce);
  return response;
}
