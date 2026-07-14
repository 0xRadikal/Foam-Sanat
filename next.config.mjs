import bundleAnalyzer from '@next/bundle-analyzer';
import envConfig from './env.config.js';

function generatePlaceholder(key) {
  return `auto-${key.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Variables whose *value* is interpreted as a URL, connection string, or
// filesystem path must never receive a synthetic "auto-…" placeholder: a fake
// value is not a valid URL and, for COMMENTS_DATABASE_URL/DATABASE_URL, is
// consumed by the storage layer as a SQLite file path — which silently creates
// a stray database file in the working directory. For these keys we only ever
// presence-check; leaving them unset lets downstream code take its correct
// "not configured" branch (SQLite default path, in-memory rate limiter, etc.).
const VALUE_SHAPED_KEYS = new Set([
  'DATABASE_URL',
  'COMMENTS_DATABASE_URL',
  'RATE_LIMIT_REDIS_URL',
  'REDIS_URL',
  'PREVIEW_URL',
  'NEXT_PUBLIC_PREVIEW_URL',
]);

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
    // Never fabricate a value for URL/connection/path-shaped keys.
    if (VALUE_SHAPED_KEYS.has(key)) continue;
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
  productionBrowserSourceMaps: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['foamsanat.com'],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

export default withBundleAnalyzer(nextConfig);
