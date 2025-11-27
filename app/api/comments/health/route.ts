import { NextResponse } from 'next/server';
import { withRequestLogging } from '../../lib/logging';
import { getCommentsStorageStatus } from '../lib/db';
import { buildAvailabilityHeaders, getStorageRetryAfterSeconds } from '../lib/status';

export const GET = withRequestLogging(async () => {
  const status = getCommentsStorageStatus();
  const retryAfterSeconds = status.ready ? undefined : getStorageRetryAfterSeconds(status);
  const headers = buildAvailabilityHeaders(
    status.ready ? 'ready' : 'offline',
    status.errorCode,
    retryAfterSeconds,
  );

  const body = {
    ready: status.ready,
    code: status.errorCode ?? null,
    attempts: status.metrics.attempts,
    successes: status.metrics.successes,
    failures: status.metrics.failures,
    lastAttemptAt: status.metrics.lastAttemptAt?.toISOString() ?? null,
    lastSuccessAt: status.metrics.lastSuccessAt?.toISOString() ?? null,
    error: status.error?.message ?? null,
  };

  return NextResponse.json(
    status.ready
      ? body
      : {
          ...body,
          retryAfterSeconds,
        },
    {
      status: status.ready ? 200 : 503,
      headers,
    },
  );
});
