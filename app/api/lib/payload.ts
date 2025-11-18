export type SanitizedFieldResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export type SanitizeStringOptions = {
  fieldName: string;
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
};

export function sanitizeStringField(
  value: unknown,
  { fieldName, minLength = 1, maxLength, toLowerCase = false }: SanitizeStringOptions,
): SanitizedFieldResult {
  if (typeof value !== 'string') {
    return { ok: false, error: `${fieldName} must be a string.` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { ok: false, error: `${fieldName} is too short.` };
  }

  if (maxLength && trimmed.length > maxLength) {
    return { ok: false, error: `${fieldName} exceeds allowed length.` };
  }

  return { ok: true, value: toLowerCase ? trimmed.toLowerCase() : trimmed };
}

export function redactPayload(payload: unknown): Record<string, string> | string {
  if (!payload || typeof payload !== 'object') {
    return '[REDACTED]';
  }

  const entries = Object.entries(payload as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => [key, '[REDACTED]'] as const);

  return Object.fromEntries(entries);
}
