import type { NextRequest } from 'next/server';

export function emitMetric(name: string, opts?: Record<string, unknown>): void {
  // mark params as intentionally unused so lint doesn't fail
  void name;
  void opts;
  // no-op placeholder for metrics emission.
  return;
}

export function withRequestLogging(handler: (...args: unknown[]) => unknown) {
  return async (request: NextRequest, ...rest: unknown[]) => {
    const logger = {
      info: (...args: unknown[]) => console.info(...args),
      warn: (...args: unknown[]) => console.warn(...args),
      error: (...args: unknown[]) => console.error(...args),
    };

    const requestId = typeof request === 'object' && request
      ? request.headers?.get?.('x-request-id') ?? 'local'
      : 'local';

    // cast to unknown/any-like signature only at call site to avoid using `any` in declarations
    return (handler as (...args: unknown[]) => unknown)(request, ...rest, { logger, requestId });
  };
}
