const envConfig = require('./env.config');

function generatePlaceholder(key) {
  return `auto-${key.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
}

function applyEnvFallbacks({ keys, severity }) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length === 0) return [];

  const lifecycle = process.env.npm_lifecycle_event;
  const isLintOrTest = lifecycle === 'lint' || lifecycle === 'test';
  const isDev = process.env.NODE_ENV !== 'production';
  const allowFallback = isDev || isLintOrTest;

  if (severity === 'required' && !allowFallback) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  for (const key of missing) {
    process.env[key] = generatePlaceholder(key);
  }

  const label = severity === 'required' ? 'Required environment variables were missing' : 'Optional environment variables are not set';
  const note = allowFallback
    ? 'Populating placeholders for local tooling.'
    : 'Some features may be disabled until these are configured.';

  console.warn(`${label}: ${missing.join(', ')}. ${note}`);

  return missing;
}

function validateBuildEnv() {
  const required = [
    ...(envConfig.public?.required || []),
    ...(envConfig.server?.required || []),
  ];
  const recommended = [
    ...(envConfig.public?.recommended || []),
    ...(envConfig.server?.recommended || []),
  ];

  applyEnvFallbacks({ keys: required, severity: 'required' });
  applyEnvFallbacks({ keys: recommended, severity: 'recommended' });
}

validateBuildEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['foamsanat.com'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ]
};

module.exports = nextConfig;
