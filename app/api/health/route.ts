import { NextResponse, type NextRequest } from 'next/server';
import { withRequestLogging, emitMetric } from '../lib/logging';
import { getCommentsStorageStatus } from '../comments/lib/db';
import { buildAvailabilityHeaders, getStorageRetryAfterSeconds } from '../comments/lib/status';

const STORAGE_HEALTH_ENABLED = process.env.ENABLE_STORAGE_HEALTHCHECK !== 'false';

export const GET = withRequestLogging(async (request: NextRequest, _context, { logger, requestId }) => {
  const includeStorage =
    STORAGE_HEALTH_ENABLED && request.nextUrl.searchParams.get('check') !== 'basic';

  const headers: HeadersInit = { 'Cache-Control': 'no-store' };
  const body: Record<string, unknown> = {
    ok: true,
    timestamp: new Date().toISOString(),
    includesStorage: includeStorage,
  };

  let status = 200;

  if (includeStorage) {
    const storageStatus = await getCommentsStorageStatus();
    body.comments = {
      ready: storageStatus.ready,
      backend: storageStatus.backend,
      errorCode: storageStatus.errorCode ?? null,
      attempts: storageStatus.metrics.attempts,
      successes: storageStatus.metrics.successes,
      failures: storageStatus.metrics.failures,
      lastAttemptAt: storageStatus.metrics.lastAttemptAt?.toISOString() ?? null,
      lastSuccessAt: storageStatus.metrics.lastSuccessAt?.toISOString() ?? null,
      connection: storageStatus.health?.connection ?? null,
    };

    if (!storageStatus.ready) {
      const retryAfterSeconds = getStorageRetryAfterSeconds(storageStatus);
      headers['Retry-After'] = retryAfterSeconds.toString();
      Object.assign(headers, buildAvailabilityHeaders('offline', storageStatus.errorCode, retryAfterSeconds));

      body.ok = false;
      body.retryAfterSeconds = retryAfterSeconds;
      body.reason = 'Comments storage unavailable';

      emitMetric('health.storage.unavailable', {
        requestId,
        tags: { code: storageStatus.errorCode ?? 'unknown' },
      });
      logger.warn('health.storage.offline', {
        code: storageStatus.errorCode,
        retryAfterSeconds,
      });
      status = 503;
    } else {
      Object.assign(headers, buildAvailabilityHeaders('ready', storageStatus.errorCode));
      emitMetric('health.storage.ready', { requestId });
    }
  }

  return NextResponse.json(body, { status, headers });
});
