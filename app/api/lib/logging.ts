import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

export type RequestLogger = {
  requestId: string;
  origin: string | null;
  info: (event: string, fields?: Record<string, unknown>) => void;
  warn: (event: string, fields?: Record<string, unknown>) => void;
  error: (event: string, fields?: Record<string, unknown>) => void;
};

export type RequestLoggingContext = {
  logger: RequestLogger;
  requestId: string;
};

type LogLevel = 'info' | 'warn' | 'error';

type MetricOptions = {
  tags?: Record<string, string | number | boolean | null>;
  value?: number;
  requestId?: string;
};

function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function normalizeOrigin(headers: Headers): string | null {
  return headers.get('origin') ?? headers.get('referer');
}

function normalizePath(request: Request): string | undefined {
  const parsed = safeParseUrl(request.url);
  return parsed?.pathname ?? undefined;
}

function normalizeError(error: unknown): { message: string; name?: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'Unknown error' };
}

function log(level: LogLevel, event: string, base: Record<string, unknown>, fields?: Record<string, unknown>) {
  const payload = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...base,
    ...fields,
  };

  switch (level) {
    case 'info':
      console.info(payload);
      break;
    case 'warn':
      console.warn(payload);
      break;
    case 'error':
      console.error(payload);
      break;
    default:
      console.log(payload);
  }
}

export function createRequestLogger(request: Request): RequestLoggingContext {
  const headers = request.headers ?? new Headers();
  const requestId = headers.get('x-request-id') ?? crypto.randomUUID();
  const origin = normalizeOrigin(headers);
  const method = request.method;
  const path = normalizePath(request);
  const userAgent = headers.get('user-agent');

  const baseFields = {
    requestId,
    origin,
    path,
    method,
    userAgent,
  } satisfies Record<string, unknown>;

  const logger: RequestLogger = {
    requestId,
    origin,
    info: (event, fields) => log('info', event, baseFields, fields),
    warn: (event, fields) => log('warn', event, baseFields, fields),
    error: (event, fields) => log('error', event, baseFields, fields),
  };

  return { logger, requestId };
}

export function withRequestLogging<TContext = unknown>(
  handler: (request: Request, context: TContext | undefined, logging: RequestLoggingContext) => Promise<NextResponse>,
): (request: Request, context?: TContext) => Promise<NextResponse> {
  return async (request: Request, context?: TContext) => {
    const { logger, requestId } = createRequestLogger(request);
    const startedAt = performance.now();
    logger.info('request.received');

    try {
      const response = await handler(request, context, { logger, requestId });
      const latencyMs = Math.round(performance.now() - startedAt);
      logger.info('request.completed', { status: response.status, latencyMs });
      response.headers.set('x-request-id', requestId);
      return response;
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startedAt);
      logger.error('request.failed', { latencyMs, error: normalizeError(error) });
      throw error;
    }
  };
}

export function emitMetric(name: string, options: MetricOptions = {}): void {
  const { tags, value = 1, requestId } = options;
  const metricPayload = {
    event: 'metric',
    name,
    value,
    tags,
    requestId,
    timestamp: new Date().toISOString(),
  };

  console.info(metricPayload);
}

export function hashIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex');
}
