import { NextRequest } from 'next/server';

import { ensureServerEnvVars } from '@/app/lib/env';

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.ip ?? request.headers.get('x-real-ip') ?? 'unknown';
}

export function assertAdmin(request: NextRequest): string | null {
  ensureServerEnvVars(['COMMENTS_ADMIN_TOKEN']);

  const header = request.headers.get('authorization');
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  const adminToken = process.env.COMMENTS_ADMIN_TOKEN;
  if (!adminToken) {
    console.warn('COMMENTS_ADMIN_TOKEN is not set.');
    return null;
  }

  return token === adminToken ? token : null;
}
