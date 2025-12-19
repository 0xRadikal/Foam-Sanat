import { NextRequest, NextResponse } from 'next/server';

import { Role } from '@prisma/client';
import { withRequestLogging } from '../../../lib/logging';
import { createSignedAdminSession } from '../../lib/auth';
import { requireSession } from '@/app/api/admin/lib/session';
import { canModerateComments } from '@/app/lib/rbac';

interface AdminSessionBody {
  adminId?: string;
  displayName?: string;
  ttlMinutes?: number;
}

interface RequestLogger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

interface RequestLoggingMeta {
  logger: RequestLogger;
}

export const POST = withRequestLogging(
  async (
    request: NextRequest,
    _context: unknown,
    { logger }: RequestLoggingMeta,
  ): Promise<NextResponse> => {
    const sessionKey =
      process.env.COMMENTS_ADMIN_SESSION_KEY ??
      process.env.COMMENTS_ADMIN_TOKEN_SECRET;

    const providedKey = request.headers.get('x-comments-admin-session-key');

    if (!sessionKey || !providedKey || sessionKey !== providedKey) {
      logger.warn('comments.admin.session.unauthorized');
      return NextResponse.json(
        { error: 'Admin session key is invalid.' },
        { status: 401 },
      );
    }

    let session;
    try {
      session = await requireSession();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canModerateComments(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: AdminSessionBody;
    try {
      body = (await request.json()) as AdminSessionBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.' },
        { status: 400 },
      );
    }

    const tokenResult = createSignedAdminSession(
      {
        id: session.user.id,
        displayName: session.user.name ?? session.user.email ?? 'Comments Admin',
      },
      { ttlMinutes: body.ttlMinutes },
    );

    if (!tokenResult) {
      return NextResponse.json(
        { error: 'Unable to create admin session.' },
        { status: 500 },
      );
    }

    logger.info('comments.admin.session.issued', {
      adminId: session.user.id ?? 'comments-admin',
      ttlMinutes:
        body.ttlMinutes ??
        process.env.COMMENTS_ADMIN_TOKEN_TTL_MINUTES ??
        'default',
      tokenId: tokenResult.tokenId,
    });

    return NextResponse.json({
      token: tokenResult.token,
      adminId: session.user.id ?? 'comments-admin',
      displayName: session.user.name ?? session.user.email ?? 'Comments Admin',
      issuedAt: tokenResult.issuedAt,
      expiresAt: tokenResult.expiresAt,
      tokenId: tokenResult.tokenId,
    });
  },
);
