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

  // Block bidirectional override and other invisible control characters that can
  // be abused to hide or reorder text content.
  const BIDI_OVERRIDES = [
    '\u202A',
    '\u202B',
    '\u202C',
    '\u202D',
    '\u202E',
    '\u2066',
    '\u2067',
    '\u2068',
    '\u2069',
    '\u200E',
    '\u200F',
    '\u061C',
  ];

  if (BIDI_OVERRIDES.some((char) => trimmed.includes(char))) {
    return { ok: false, error: `${fieldName} contains invalid characters.` };
  }

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
