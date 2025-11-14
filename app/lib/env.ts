// app/lib/env.ts
// ✅ FIX #8: Environment variable validation

type EnvVar = {
  key: string;
  required: boolean;
  serverOnly?: boolean;
};

const ENV_VARS: EnvVar[] = [
  // Client-side (must have NEXT_PUBLIC_ prefix)
  { key: 'NEXT_PUBLIC_SITE_URL', required: true },
  { key: 'NEXT_PUBLIC_GA_ID', required: false },
  { key: 'NEXT_PUBLIC_GTM_ID', required: false },
  { key: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', required: false },
  
  // Server-side only
  { key: 'COMMENTS_ADMIN_TOKEN', required: true, serverOnly: true },
  { key: 'RESEND_API_KEY', required: false, serverOnly: true },
  { key: 'RESEND_FROM_EMAIL', required: false, serverOnly: true },
  { key: 'TURNSTILE_SECRET_KEY', required: false, serverOnly: true },
  { key: 'DATABASE_URL', required: false, serverOnly: true },
  { key: 'CONTACT_EMAIL', required: false, serverOnly: true },
  { key: 'CONTACT_PHONE', required: false, serverOnly: true },
];

export function validateEnv() {
  const isServer = typeof window === 'undefined';
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required, serverOnly } of ENV_VARS) {
    // Skip server-only vars on client
    if (!isServer && serverOnly) continue;

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
}

// Validate on module load (server-side only to avoid browser errors)
if (typeof window === 'undefined') {
  validateEnv();
}