import { NextResponse } from 'next/server';
import { getCommentsStorageStatus } from '../lib/db';

function buildStatusHeaders(status: 'ready' | 'offline', errorCode?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'X-Comments-Status': status,
  };

  if (errorCode) {
    headers['X-Comments-Error-Code'] = errorCode;
  }

  return headers;
}

export async function GET() {
  const status = getCommentsStorageStatus();
  const headers = buildStatusHeaders(status.ready ? 'ready' : 'offline', status.errorCode);

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

  return NextResponse.json(body, {
    status: status.ready ? 200 : 503,
    headers,
  });
}
