import { bootstrapServer } from '../../lib/server-bootstrap';

const DEFAULT_SITE_URL = 'https://foamsanat.com';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const PREVIEW_URL_ENV_KEYS = [
  'VERCEL_BRANCH_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'VERCEL_URL',
  'NEXT_PUBLIC_VERCEL_URL',
  'DEPLOYMENT_URL',
  'NEXT_PUBLIC_DEPLOYMENT_URL',
  'PREVIEW_URL',
  'NEXT_PUBLIC_PREVIEW_URL',
];

bootstrapServer();

type CandidateOrigin = string | null | undefined;

function ensureUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
}

function parseOrigin(candidate?: CandidateOrigin): string | null {
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return null;
  }
}

function addOriginCandidate(allowed: Set<string>, candidate?: CandidateOrigin): void {
  const normalized = parseOrigin(candidate);
  if (normalized) {
    allowed.add(normalized);
  }
}

function addHostnameVariants(allowed: Set<string>, hostname?: CandidateOrigin): void {
  if (!hostname) return;

  const normalized = ensureUrl(hostname);

  addOriginCandidate(allowed, normalized);

  try {
    const parsed = new URL(normalized);
    addOriginCandidate(allowed, `http://${parsed.host}`);
  } catch {
    // Ignore invalid hostnames
  }
}

function addOriginList(allowed: Set<string>, list?: string | null): void {
  if (!list) return;

  list
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => addOriginCandidate(allowed, ensureUrl(entry)));
}

function addPreviewOrigins(allowed: Set<string>): void {
  for (const key of PREVIEW_URL_ENV_KEYS) {
    addHostnameVariants(allowed, process.env[key]);
  }

  addOriginList(allowed, process.env.COMMENTS_ALLOWED_PREVIEW_URLS);
  addOriginList(allowed, process.env.ALLOWED_PREVIEW_ORIGINS);
}
export function getAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();
  const isDev = process.env.NODE_ENV !== 'production';

  // دامنه اصلی
  addOriginCandidate(allowed, parseOrigin(DEFAULT_SITE_URL));

  // دامنه‌ی public سایت (مثلاً https://foam-sanat.com)
  addOriginCandidate(allowed, process.env.NEXT_PUBLIC_SITE_URL);
  addHostnameVariants(allowed, process.env.NEXT_PUBLIC_SITE_URL);

  // Vercel previewها
  addHostnameVariants(allowed, process.env.VERCEL_URL);

  // URLهای preview تعریف‌شده در env
  addPreviewOrigins(allowed);

  // لیست‌های اضافه از env
  addOriginList(
    allowed,
    process.env.COMMENTS_ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS,
  );

  // ✅ فقط در dev/local، localhost باز باشد
  if (isDev) {
    addOriginCandidate(allowed, 'http://localhost:3000');
    addOriginCandidate(allowed, 'http://localhost');
    addOriginCandidate(allowed, 'http://127.0.0.1:3000');
  }

  return allowed;
}

function safeHost(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function getSafePathname(request: Request): string | undefined {
  try {
    return new URL(request.url).pathname;
  } catch {
    return undefined;
  }
}

function logRejectedOrigin(
  reason: 'origin' | 'referer',
  request: Request,
  allowedOrigins: Set<string>,
  origin: string | null,
  referer: string | null,
): void {
  console.warn('Rejected request due to invalid origin policy.', {
    reason,
    originHost: safeHost(origin),
    refererHost: safeHost(referer),
    method: request.method,
    path: getSafePathname(request),
    allowedOrigins: allowedOrigins.size,
  });
}

export function validateRequestOrigin(request: Request): string | null {
  const allowedOrigins = getAllowedOrigins();

  const origin = parseOrigin(request.headers.get('origin'));
  const referer = parseOrigin(request.headers.get('referer'));

  if (origin && !allowedOrigins.has(origin)) {
    logRejectedOrigin('origin', request, allowedOrigins, origin, referer);
    return 'Request origin is not allowed.';
  }

  if (referer && !allowedOrigins.has(referer)) {
    logRejectedOrigin('referer', request, allowedOrigins, origin, referer);
    return 'Request referer is not allowed.';
  }

  return null;
}

type CaptchaVerificationError = {
  message: string;
  status: number;
  retryAfterSeconds?: number;
};

const CAPTCHA_RETRY_AFTER_SECONDS = 120;

export async function verifyTurnstileToken(
  token?: string | null,
): Promise<CaptchaVerificationError | null> {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const isProd = process.env.NODE_ENV === 'production';
  if (!secretKey) {
    console.error('Turnstile verification failed: missing TURNSTILE_SECRET_KEY.');
    return {
      message: 'CAPTCHA verification is unavailable due to server configuration.',
      status: 500,
      retryAfterSeconds: CAPTCHA_RETRY_AFTER_SECONDS,
    };
  }

  if (!token || token.trim().length === 0) {
    if (!isProd) {
      console.info(
        'Turnstile token not provided; skipping verification in non-production environments.',
      );
      return null;
    }

    console.warn('Turnstile secret configured but token was not provided with the request.');
    return { message: 'CAPTCHA token is required.', status: 403 };
  }

  const trimmedToken = token.trim();

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', trimmedToken);

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.warn('Turnstile verification request failed', { error });
    return {
      message: 'Unable to verify CAPTCHA at this time. Please try again later.',
      status: 503,
      retryAfterSeconds: CAPTCHA_RETRY_AFTER_SECONDS,
    };
  }

  if (!verificationResponse.ok) {
    console.warn('Turnstile verification failed to respond successfully', {
      status: verificationResponse.status,
    });
    return {
      message: 'Unable to verify CAPTCHA at this time. Please try again later.',
      status: 503,
      retryAfterSeconds: CAPTCHA_RETRY_AFTER_SECONDS,
    };
  }

  let verification: { success?: boolean };
  try {
    verification = (await verificationResponse.json()) as { success?: boolean };
  } catch (error) {
    console.warn('Turnstile verification responded with invalid JSON', { error });
    return {
      message: 'Unable to verify CAPTCHA at this time. Please try again later.',
      status: 503,
      retryAfterSeconds: CAPTCHA_RETRY_AFTER_SECONDS,
    };
  }
  if (!verification?.success) {
    return { message: 'CAPTCHA verification failed.', status: 403 };
  }

  return null;
}
