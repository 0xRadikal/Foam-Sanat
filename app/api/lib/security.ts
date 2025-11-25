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
    if (process.env.NODE_ENV === 'production') {
      console.error('Turnstile verification failed: missing TURNSTILE_SECRET_KEY.');
      return {
        message: 'CAPTCHA verification is unavailable due to server configuration.',
        status: 500,
      };
    }

    return null;
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
