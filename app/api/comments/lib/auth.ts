import { NextRequest } from 'next/server';

import { ensureServerEnvVars } from '../../../lib/env';

const DEFAULT_TRUSTED_PROXIES = new Set(['127.0.0.1', '::1']);

function getTrustedProxies(): Set<string> {
  const env = process.env.TRUSTED_PROXY_IPS;
  const proxies = new Set(DEFAULT_TRUSTED_PROXIES);

  if (!env) return proxies;

  for (const entry of env.split(',')) {
    const trimmed = entry.trim();
    if (trimmed) {
      proxies.add(trimmed);
    }
  }

  return proxies;
}

export function getClientIdentifier(request: NextRequest): string {
  const clientIp = request.ip ?? request.headers.get('x-real-ip');
  const forwarded = request.headers.get('x-forwarded-for');
  const trustedProxies = getTrustedProxies();

  if (forwarded && clientIp && trustedProxies.has(clientIp)) {
    const [firstHop] = forwarded.split(',').map((ip) => ip.trim()).filter(Boolean);
    if (firstHop) {
      return firstHop;
    }
  }

  return clientIp ?? 'unknown';
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
