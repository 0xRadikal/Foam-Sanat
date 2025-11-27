import { NextRequest, NextResponse } from 'next/server';

import { withRequestLogging } from '../../../lib/logging';
import { createSignedAdminSession } from '../../lib/auth';

export const POST = withRequestLogging(async (request: NextRequest, _context, { logger }) => {
  const sessionKey = process.env.COMMENTS_ADMIN_SESSION_KEY ?? process.env.COMMENTS_ADMIN_TOKEN_SECRET;
  const providedKey = request.headers.get('x-comments-admin-session-key');

  if (!sessionKey || !providedKey || sessionKey !== providedKey) {
    logger.warn('comments.admin.session.unauthorized');
    return NextResponse.json({ error: 'Admin session key is invalid.' }, { status: 401 });
  }

  let body: { adminId?: string; displayName?: string; ttlMinutes?: number };
  try {
    body = (await request.json()) as { adminId?: string; displayName?: string; ttlMinutes?: number };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const tokenResult = createSignedAdminSession(
    { id: body.adminId, displayName: body.displayName },
    { ttlMinutes: body.ttlMinutes },
  );

  if (!tokenResult) {
    return NextResponse.json({ error: 'Unable to create admin session.' }, { status: 500 });
  }

  logger.info('comments.admin.session.issued', {
    adminId: body.adminId ?? 'comments-admin',
    ttlMinutes: body.ttlMinutes ?? process.env.COMMENTS_ADMIN_TOKEN_TTL_MINUTES ?? 'default',
    tokenId: tokenResult.tokenId,
  });

  return NextResponse.json({
    token: tokenResult.token,
    adminId: body.adminId ?? 'comments-admin',
    displayName: body.displayName ?? 'Comments Admin',
    issuedAt: tokenResult.issuedAt,
    expiresAt: tokenResult.expiresAt,
    tokenId: tokenResult.tokenId,
  });
});
