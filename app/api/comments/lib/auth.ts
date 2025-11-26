import { NextRequest } from 'next/server';

import { ensureServerEnvVars } from '../../../lib/env';

export type AdminIdentity = {
  id: string;
  displayName: string;
  token: string;
};

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

function parseAdminIdentities(): AdminIdentity[] {
  ensureServerEnvVars(['COMMENTS_ADMIN_TOKEN']);

  const fallbackToken = process.env.COMMENTS_ADMIN_TOKEN;
  const defaultAdmin: AdminIdentity | null = fallbackToken
    ? {
        token: fallbackToken,
        id: process.env.COMMENTS_ADMIN_ID || 'comments-admin',
        displayName: process.env.COMMENTS_ADMIN_NAME || 'Comments Admin',
      }
    : null;

  const configuredAdminsRaw = process.env.COMMENTS_ADMIN_IDENTITIES;
  if (!configuredAdminsRaw) {
    return defaultAdmin ? [defaultAdmin] : [];
  }

  try {
    const parsed = JSON.parse(configuredAdminsRaw) as unknown;
    if (!Array.isArray(parsed)) {
      console.warn('COMMENTS_ADMIN_IDENTITIES must be a JSON array.');
      return defaultAdmin ? [defaultAdmin] : [];
    }

    const adminEntries = parsed
      .map((entry) => {
        if (
          entry &&
          typeof entry === 'object' &&
          'token' in entry &&
          typeof (entry as { token: unknown }).token === 'string'
        ) {
          const { token, id, displayName } = entry as {
            token: string;
            id?: string;
            displayName?: string;
          };
          return {
            token,
            id: id?.trim() || 'comments-admin',
            displayName: displayName?.trim() || 'Comments Admin',
          } satisfies AdminIdentity;
        }
        return null;
      })
      .filter(Boolean) as AdminIdentity[];

    if (adminEntries.length === 0) {
      console.warn('COMMENTS_ADMIN_IDENTITIES did not include any valid admin entries.');
      return defaultAdmin ? [defaultAdmin] : [];
    }

    return adminEntries;
  } catch (error) {
    console.warn('Failed to parse COMMENTS_ADMIN_IDENTITIES. Falling back to default admin.', { error });
    return defaultAdmin ? [defaultAdmin] : [];
  }
}

export function assertAdmin(request: NextRequest): AdminIdentity | null {
  const header = request.headers.get('authorization');
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  const admin = parseAdminIdentities().find((entry) => entry.token === token.trim());
  if (!admin) {
    console.warn('Invalid admin token received.');
  }
  return admin ?? null;
}
