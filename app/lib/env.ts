// app/lib/env.ts
// ✅ FIX #8: Environment variable validation

type EnvVar = {
  key: string;
  level: 'critical' | 'warn';
};

const ENV_VARS: EnvVar[] = [
  // Client-side (must have NEXT_PUBLIC_ prefix)
  { key: 'NEXT_PUBLIC_SITE_URL', level: 'warn' },
  { key: 'NEXT_PUBLIC_GA_ID', level: 'warn' },
  { key: 'NEXT_PUBLIC_GTM_ID', level: 'warn' },
  { key: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', level: 'warn' },

  // Server-side only
  { key: 'COMMENTS_ADMIN_TOKEN', level: 'critical' },
  { key: 'RESEND_API_KEY', level: 'warn' },
  { key: 'RESEND_FROM_EMAIL', level: 'warn' },
  { key: 'TURNSTILE_SECRET_KEY', level: 'warn' },
  { key: 'DATABASE_URL', level: 'warn' },
  { key: 'CONTACT_EMAIL', level: 'warn' },
  { key: 'CONTACT_PHONE', level: 'warn' },
];

let hasValidated = false;

export function validateEnv({ force = false }: { force?: boolean } = {}) {
  const isServer = typeof window === 'undefined';
  if (!isServer) {
    return;
  }

  if (hasValidated && !force) {
    return;
  }

  const missingCritical: string[] = [];
  const warnings: string[] = [];

  for (const { key, level } of ENV_VARS) {
    const value = process.env[key];

    if (level === 'critical' && !value) {
      missingCritical.push(key);
    } else if (!value) {
      warnings.push(key);
    }
  }

  if (missingCritical.length > 0) {
    const errorMessage = `
❌ CRITICAL: Missing required environment variables:
${missingCritical.map(key => `  • ${key}`).join('\n')}

Please check your .env.local file and ensure all required variables are set.
Refer to .env.example for the template.
`;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    }

    console.warn(errorMessage);
  }

  if (warnings.length > 0) {
    console.warn(`
⚠️  Optional environment variables not set:
${warnings.map(key => `  • ${key}`).join('\n')}

Some features may be disabled. Check .env.example for details.
`);
  }

  hasValidated = true;
}

export function ensureServerEnvVars(requiredKeys: string[]) {
  if (typeof window !== 'undefined' || requiredKeys.length === 0) {
    return;
  }

  const missing = requiredKeys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMessage = `
❌ CRITICAL: Missing required environment variables:
${missing.map(key => `  • ${key}`).join('\n')}

Please set them in your server environment (e.g. .env.local or hosting provider secrets).
Refer to .env.example for the template.
`;
    throw new Error(errorMessage);
  }
}

