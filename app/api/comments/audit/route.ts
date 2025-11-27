import { NextRequest, NextResponse } from 'next/server';

import { withRequestLogging } from '../../lib/logging';
import { assertAdmin } from '../lib/auth';
import { listModerationAudits } from '../lib/audit';

export const GET = withRequestLogging(async (request: NextRequest, _context, { logger }) => {
  const admin = assertAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const parsedLimit = limitParam ? Number(limitParam) : 100;
  const audits = listModerationAudits(parsedLimit);

  logger.info('comments.audit.fetch', { count: audits.length, limit: parsedLimit });
  return NextResponse.json({ audits });
});
