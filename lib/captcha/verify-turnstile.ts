import type { TurnstileVerifyResponse } from './types';

const TURNSTILE_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<TurnstileVerifyResponse> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured');
  }

  const payload = new URLSearchParams();
  payload.append('secret', secretKey);
  payload.append('response', token);
  if (remoteIp) {
    payload.append('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}`);
  }

  const data = (await response.json()) as TurnstileVerifyResponse;
  return data;
}
