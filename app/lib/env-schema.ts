// app/lib/env-schema.ts
// Value-level validation for environment variables using Zod.
//
// This complements the presence checks in `env.ts` (which only assert that a
// variable is set). Here we validate the *shape* of variables that are present:
// URLs must parse, secrets must meet a minimum length, enums must be one of the
// allowed values, numeric settings must be positive integers, etc.
//
// Design goals:
//   - Only validate values that are actually present (absence is handled by the
//     existing presence-check layer, which knows required vs recommended).
//   - Never validate on the client: this runs server-side only.
//   - Fail fast in production; warn (do not throw) in development/test so local
//     tooling and the test suite are not blocked by placeholder values.
import { z } from 'zod';

const isServerRuntime = typeof window === 'undefined';

/** A string that must parse as an absolute http(s) URL when provided. */
const httpUrl = z
  .string()
  .trim()
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'must be an absolute http(s) URL' },
  );

/** A connection-string style URL (postgres/redis/file) — just needs a scheme. */
const connectionUrl = z
  .string()
  .trim()
  .refine((value) => /^[a-z][a-z0-9+.-]*:\/\/|^file:/i.test(value), {
    message: 'must be a connection URL (e.g. postgres://…, redis://…, file:…)',
  });

/** A secret that must not be a placeholder and must be reasonably long. */
const strongSecret = z
  .string()
  .min(16, { message: 'must be at least 16 characters' })
  .refine((value) => !/replace-with|changeme|change-me|^secret$|^password$/i.test(value), {
    message: 'looks like a placeholder; set a strong random value',
  });

// The schema validates only the *format* of present values. Every field is
// optional here because required-ness is enforced by the presence-check layer.
const EnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: httpUrl.optional(),
    NEXT_PUBLIC_PREVIEW_URL: httpUrl.optional(),
    PREVIEW_URL: httpUrl.optional(),

    NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().optional(),
    CONTACT_EMAIL: z.string().email().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),

    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),

    RESEND_API_KEY: z
      .string()
      .refine((v) => v.startsWith('re_'), { message: 'Resend keys start with "re_"' })
      .optional(),

    DATABASE_URL: connectionUrl.optional(),
    COMMENTS_DATABASE_URL: connectionUrl.optional(),
    RATE_LIMIT_REDIS_URL: connectionUrl.optional(),
    REDIS_URL: connectionUrl.optional(),

    COMMENTS_STORAGE_BACKEND: z.enum(['sqlite', 'postgres', 'memory']).optional(),

    COMMENTS_ADMIN_TOKEN_SECRET: strongSecret.optional(),
    COMMENTS_ADMIN_TOKEN_SECRETS: z.string().min(16).optional(),

    COMMENTS_ADMIN_TOKEN_TTL_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
  })
  // Extra, unknown variables are fine — we only validate the ones we know.
  .passthrough();

export type ValidatedEnv = z.infer<typeof EnvSchema>;

/**
 * Validate the *format* of environment variable values that are present.
 * Returns the parsed object on success. On failure: throws in production,
 * warns (and returns the raw env) in development/test.
 */
export function validateEnvSchema(
  env: NodeJS.ProcessEnv = process.env,
): ValidatedEnv | NodeJS.ProcessEnv {
  if (!isServerRuntime) return env;

  // Only pass through defined values so `optional()` fields are truly skipped
  // when unset (an explicit `undefined` key still counts as present in Zod).
  const present: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && value.length > 0) {
      present[key] = value;
    }
  }

  const result = EnvSchema.safeParse(present);
  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  const message = `Invalid environment variable value(s):\n${issues}`;

  if (env.NODE_ENV === 'production') {
    // Fail fast: a misconfigured production deploy should not boot.
    throw new Error(message);
  }

  console.warn({ event: 'env.invalid.format', message });
  return present;
}
