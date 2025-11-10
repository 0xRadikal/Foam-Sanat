interface RequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
}

interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor({ status, message, details }: ApiError) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiClientError';
  }
}

export async function postJson<TBody, TResponse>(url: string, body: TBody, options: RequestOptions = {}): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      message: payload?.error ?? 'Request failed',
      details: payload?.details,
    });
  }

  return payload as TResponse;
}
