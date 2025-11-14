// app/lib/env.ts
// ✅ FIX #8: Environment variable validation

type EnvVar = {
  key: string;
  required: boolean;
};

const ENV_VARS: EnvVar[] = [
  // Client-side (must have NEXT_PUBLIC_ prefix)
  { key: 'NEXT_PUBLIC_SITE_URL', required: true },
  { key: 'NEXT_PUBLIC_GA_ID', required: false },
  { key: 'NEXT_PUBLIC_GTM_ID', required: false },
  { key: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', required: false },
  
  // Server-side only
  { key: 'COMMENTS_ADMIN_TOKEN', required: true },
  { key: 'RESEND_API_KEY', required: false },
  { key: 'RESEND_FROM_EMAIL', required: false },
  { key: 'TURNSTILE_SECRET_KEY', required: false },
  { key: 'DATABASE_URL', required: false },
  { key: 'CONTACT_EMAIL', required: false },
  { key: 'CONTACT_PHONE', required: false },
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

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required } of ENV_VARS) {
    const value = process.env[key];

    if (required && !value) {
      missing.push(key);
    } else if (!required && !value) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
❌ CRITICAL: Missing required environment variables:
${missing.map(key => `  • ${key}`).join('\n')}

Please check your .env.local file and ensure all required variables are set.
Refer to .env.example for the template.
`;
    throw new Error(errorMessage);
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
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

