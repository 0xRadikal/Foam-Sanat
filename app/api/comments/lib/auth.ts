import crypto from 'node:crypto';
import { NextRequest } from 'next/server';

import { ensureServerEnvVars } from '../../../lib/env';
import { recordModerationAudit } from './audit';

export type AuthenticatedAdmin = {
  id: string;
  displayName: string;
  tokenId?: string;
  issuedAt?: string;
  expiresAt?: string;
  source: 'signed' | 'legacy';
};

type AdminTokenPayload = {
  sub?: string;
  adminId?: string;
  name?: string;
  displayName?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}; 

const DEFAULT_TRUSTED_PROXIES = new Set(['127.0.0.1', '::1']);
const ADMIN_TOKEN_ALG = 'HS256';
const ADMIN_TOKEN_TTL_MINUTES = Number(process.env.COMMENTS_ADMIN_TOKEN_TTL_MINUTES ?? '180');

let adminSecretWarned = false;

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

function getAdminTokenSecrets(): string[] {
  const configuredSecrets =
    process.env.COMMENTS_ADMIN_TOKEN_SECRETS ?? process.env.COMMENTS_ADMIN_TOKEN_SECRET;

  if (!configuredSecrets) {
    if (!adminSecretWarned && process.env.NODE_ENV !== 'test') {
      adminSecretWarned = true;
      console.error('COMMENTS_ADMIN_TOKEN_SECRET is required to validate admin tokens.');
    }
    return [];
  }

  return configuredSecrets
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function base64UrlDecode(segment: string): string {
  return Buffer.from(segment, 'base64url').toString('utf8');
}

function base64UrlEncode(segment: string): string {
  return Buffer.from(segment, 'utf8').toString('base64url');
}

function createSignature(content: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(content).digest('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}
function verifySignature(segments: string[], signature: string, secrets: string[]): string | null {
  const signingInput = segments.slice(0, 2).join('.');

  for (const secret of secrets) {
    const expected = createSignature(signingInput, secret);
    if (timingSafeEqual(signature, expected)) {
      return secret;
    }
  }

  return null;
}


function getPrimaryAdminSecret(): string | null {
  const secrets = getAdminTokenSecrets();
  return secrets.length > 0 ? secrets[0] : null;
}

function verifySignedAdminToken(token: string): AuthenticatedAdmin | null {
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = segments;
  const secrets = getAdminTokenSecrets();
  if (secrets.length === 0) {
    return null;
  }

  let header: { alg?: string; typ?: string };
  let payload: AdminTokenPayload;

  try {
    header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string; typ?: string };
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminTokenPayload;
  } catch (error) {
    console.warn('Failed to decode admin token.', { error });
    return null;
  }

  if (header.typ !== 'JWT' || header.alg !== ADMIN_TOKEN_ALG) {
    return null;
  }

  const matchedSecret = verifySignature([encodedHeader, encodedPayload], signature, secrets);
  if (!matchedSecret) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.iat || !payload.exp) {
    console.warn('Admin token rejected because required time claims are missing.', {
      tokenId: payload.jti,
    });
    return null;
  }

  if (payload.exp < now) {
    console.warn('Admin token rejected because it is expired.', {
      tokenId: payload.jti,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    return null;
  }

  const issuedAt = payload.iat;
  const expiresAtSeconds = payload.exp;

  return {
    id: payload.sub || payload.adminId || 'comments-admin',
    displayName: payload.name || payload.displayName || 'Comments Admin',
    tokenId: payload.jti,
    issuedAt: issuedAt ? new Date(issuedAt * 1000).toISOString() : undefined,
    expiresAt: expiresAtSeconds ? new Date(expiresAtSeconds * 1000).toISOString() : undefined,
    source: 'signed',
  } satisfies AuthenticatedAdmin;
}

export function createSignedAdminSession(
  admin: { id?: string | null; displayName?: string | null },
  options: { ttlMinutes?: number } = {},
): { token: string; tokenId: string; issuedAt: string; expiresAt: string } | null {
  const secret = getPrimaryAdminSecret();
  if (!secret) {
    console.error('Unable to create admin session: COMMENTS_ADMIN_TOKEN_SECRET is not configured.');
    return null;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const tokenId = crypto.randomUUID();
  const ttlMinutes = Math.max(options.ttlMinutes ?? ADMIN_TOKEN_TTL_MINUTES, 1);
  const expiresSeconds = nowSeconds + ttlMinutes * 60;

  const header = { alg: ADMIN_TOKEN_ALG, typ: 'JWT' } satisfies Record<string, string>;
  const payload: AdminTokenPayload = {
    sub: admin.id?.trim() || 'comments-admin',
    adminId: admin.id?.trim() || 'comments-admin',
    name: admin.displayName?.trim() || 'Comments Admin',
    displayName: admin.displayName?.trim() || 'Comments Admin',
    iat: nowSeconds,
    exp: expiresSeconds,
    jti: tokenId,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);

  return {
    token: `${encodedHeader}.${encodedPayload}.${signature}`,
    tokenId,
    issuedAt: new Date(nowSeconds * 1000).toISOString(),
    expiresAt: new Date(expiresSeconds * 1000).toISOString(),
  };
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
}

export function assertAdmin(request: NextRequest): AuthenticatedAdmin | null {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  const signedAdmin = verifySignedAdminToken(token);
  if (signedAdmin) {
    return signedAdmin;
  }

  console.warn('Invalid admin token received.');
  return null;
}

export function logModerationAudit(
  action: 'update-status' | 'delete-comment' | 'reply-comment',
  admin: AuthenticatedAdmin,
  metadata: Record<string, unknown>,
) {
  const performedAt = new Date().toISOString();

  recordModerationAudit(action, admin, { ...metadata, performedAt });
  console.info('Comments moderation audit', {
    action,
    performedAt,
    adminId: admin.id,
    adminDisplayName: admin.displayName,
    tokenId: admin.tokenId,
    tokenSource: admin.source,
    expiresAt: admin.expiresAt,
    issuedAt: admin.issuedAt,
    metadata,
  });
}

export function describeAdminToken(): Record<string, unknown> {
  ensureServerEnvVars(['COMMENTS_ADMIN_TOKEN_SECRET']);

  const secrets = getAdminTokenSecrets();
  return {
    secretsConfigured: secrets.length,
    ttlMinutes: ADMIN_TOKEN_TTL_MINUTES,
    rotationEnabled: secrets.length > 1,
  };
}
