const DEFAULT_SITE_URL = 'https://foamsanat.com';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function parseOrigin(candidate?: string | null): string | null {
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();

  const siteUrl = parseOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL;
  allowed.add(siteUrl);
  allowed.add('http://localhost:3000');
  allowed.add('http://localhost');

  return allowed;
}

export function validateRequestOrigin(request: Request): string | null {
  const allowedOrigins = getAllowedOrigins();

  const origin = parseOrigin(request.headers.get('origin'));
  const referer = parseOrigin(request.headers.get('referer'));

  if (origin && !allowedOrigins.has(origin)) {
    return 'Request origin is not allowed.';
  }

  if (referer && !allowedOrigins.has(referer)) {
    return 'Request referer is not allowed.';
  }

  return null;
}

export async function verifyTurnstileToken(token?: string | null): Promise<string | null> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!token) {
    console.warn('Turnstile secret configured but token was not provided with the request.');
    return null;
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.warn('Turnstile verification failed to respond successfully', {
      status: response.status,
    });
    return 'CAPTCHA verification failed.';
  }

  const verification = (await response.json()) as { success?: boolean };
  if (!verification?.success) {
    return 'CAPTCHA verification failed.';
  }

  return null;
}
