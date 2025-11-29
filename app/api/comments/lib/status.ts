import { NextResponse } from 'next/server';
import { emitMetric, type RequestLogger } from '../../lib/logging';
import { getCommentsStorageError, getCommentsStorageStatus } from './db';

export type StorageStatus = Awaited<ReturnType<typeof getCommentsStorageStatus>>;

type AvailabilityState = 'ready' | 'offline';

type UnavailableResponseOptions = {
  logger?: RequestLogger;
  requestId?: string;
  status?: StorageStatus;
};

export function buildAvailabilityHeaders(
  status: AvailabilityState,
  errorCode?: string | null,
  retryAfterSeconds?: number,
): HeadersInit {
  const headers: Record<string, string> = {
    'X-Comments-Status': status,
  };

  if (errorCode) {
    headers['X-Comments-Error-Code'] = errorCode;
  }

  if (retryAfterSeconds) {
    headers['Retry-After'] = retryAfterSeconds.toString();
  }

  return headers;
}

export function getStorageRetryAfterSeconds(status: StorageStatus): number {
  if (status.errorCode === 'COMMENTS_DB_READ_ONLY_ENVIRONMENT') {
    return 3600; // 1 hour; requires deployment changes before becoming available
  }

  return 300; // Default 5-minute backoff for transient initialization errors
}

export async function buildUnavailableResponse({
  logger,
  requestId,
  status,
}: UnavailableResponseOptions): Promise<NextResponse> {
  const resolvedStatus = status ?? (await getCommentsStorageStatus());
  const retryAfterSeconds = getStorageRetryAfterSeconds(resolvedStatus);
  const errorCode = resolvedStatus.errorCode ?? 'COMMENTS_STORAGE_UNAVAILABLE';
  const baseMessage =
    resolvedStatus.errorCode === 'COMMENTS_DB_READ_ONLY_ENVIRONMENT'
      ? 'Comments are disabled because persistent storage is not configured in this environment.'
      : 'Comments are currently unavailable. Please try again later.';
  const errorDetails =
    resolvedStatus.error?.message ?? (await getCommentsStorageError())?.message ?? null;

  emitMetric('comments.storage.unavailable', {
    requestId,
    tags: { code: errorCode },
  });

  logger?.warn('comments.storage.unavailable', {
    code: errorCode,
    retryAfterSeconds,
    attempts: resolvedStatus.metrics.attempts,
    failures: resolvedStatus.metrics.failures,
    lastAttemptAt: resolvedStatus.metrics.lastAttemptAt,
  });

  return NextResponse.json(
    {
      error: baseMessage,
      code: errorCode,
      status: 'offline',
      retryAfterSeconds,
      details: errorDetails,
    },
    {
      status: 503,
      headers: buildAvailabilityHeaders('offline', errorCode, retryAfterSeconds),
    },
  );
}

export async function ensureCommentsAvailable(
  requestId?: string,
  logger?: RequestLogger,
): Promise<NextResponse | null> {
  const status = await getCommentsStorageStatus();

  if (status.ready) {
    return null;
  }

  return buildUnavailableResponse({ status, logger, requestId });
}

export async function getCommentsAvailability() {
  const status = await getCommentsStorageStatus();

  return {
    enabled: status.ready,
    reason:
      status.ready
        ? null
        : status.error?.message ??
          (status.errorCode === 'COMMENTS_DB_READ_ONLY_ENVIRONMENT'
            ? 'Comments are disabled due to missing persistent database configuration.'
            : status.errorCode ?? 'COMMENTS_STORAGE_UNAVAILABLE'),
    status,
  } as const;
}
