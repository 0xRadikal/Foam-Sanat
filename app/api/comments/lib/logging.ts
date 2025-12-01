import type { NextRequest } from 'next/server';
import { createRequestLogger, type RequestLoggingContext } from '../../lib/logging';

type MetricOptions = {
  value?: number;
  tags?: Record<string, string | number | boolean | null | undefined>;
  requestId?: string;
};

export function emitMetric(name: string, opts: MetricOptions = {}): void {
  const payload = {
    event: 'metric',
    name,
    value: opts.value ?? 1,
    tags: opts.tags,
    requestId: opts.requestId,
    timestamp: new Date().toISOString(),
  };

  console.info(payload);
}

export function withRequestLogging(handler: (...args: unknown[]) => unknown) {
  return async (
    request: NextRequest,
    ...rest: unknown[]
  ): Promise<unknown> => {
    const logging: RequestLoggingContext = createRequestLogger(request);

    // cast to unknown/any-like signature only at call site to avoid using `any` in declarations
    return (handler as (...args: unknown[]) => unknown)(request, ...rest, logging);
  };
}
