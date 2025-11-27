import type { NextRequest } from 'next/server';

export function emitMetric(_name: string, _opts?: Record<string, unknown>): void {
  // no-op placeholder for metrics emission.
  return;
}

export function withRequestLogging(handler: any) {
  return async (request: NextRequest, ...rest: any[]) => {
    const logger = {
      info: (...args: unknown[]) => console.info(...args),
      warn: (...args: unknown[]) => console.warn(...args),
      error: (...args: unknown[]) => console.error(...args),
    };

    const requestId = typeof request === 'object' && request
      ? request.headers?.get?.('x-request-id') ?? 'local'
      : 'local';

    return handler(request, ...rest, { logger, requestId });
  };
}
