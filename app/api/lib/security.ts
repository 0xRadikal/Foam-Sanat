const DEFAULT_SITE_URL = 'https://foamsanat.com';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const PREVIEW_URL_ENV_KEYS = [
  'VERCEL_BRANCH_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
  'VERCEL_URL',
  'NEXT_PUBLIC_VERCEL_URL',
  'DEPLOYMENT_URL',
  'NEXT_PUBLIC_DEPLOYMENT_URL',
];

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

  addOriginCandidate(allowed, ensureUrl(hostname));
  addOriginCandidate(allowed, `http://${hostname}`);
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

  addOriginCandidate(allowed, parseOrigin(DEFAULT_SITE_URL));

  addOriginCandidate(allowed, process.env.NEXT_PUBLIC_SITE_URL);
  addHostnameVariants(allowed, process.env.NEXT_PUBLIC_SITE_URL);

  addHostnameVariants(allowed, process.env.VERCEL_URL);

  addPreviewOrigins(allowed);

  addOriginList(allowed, process.env.COMMENTS_ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS);

  addOriginCandidate(allowed, 'http://localhost:3000');
  addOriginCandidate(allowed, 'http://localhost');

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
};

export async function verifyTurnstileToken(
  token?: string | null,
): Promise<CaptchaVerificationError | null> {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('Turnstile verification failed: missing TURNSTILE_SECRET_KEY.');
    return {
      message: 'CAPTCHA verification is unavailable due to server configuration.',
      status: 500,
    };
  }

  if (!token || token.trim().length === 0) {
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
    };
  }

  if (!verificationResponse.ok) {
    console.warn('Turnstile verification failed to respond successfully', {
      status: verificationResponse.status,
    });
    return {
      message: 'Unable to verify CAPTCHA at this time. Please try again later.',
      status: 503,
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
    };
  }
  if (!verification?.success) {
    return { message: 'CAPTCHA verification failed.', status: 403 };
  }

  return null;
}
