import { defineConfig } from '@playwright/test';

const PREVIEW_URL_CANDIDATES = [
  process.env.PREVIEW_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_URL,
  process.env.NEXT_PUBLIC_DEPLOYMENT_URL,
  process.env.DEPLOYMENT_URL,
];

function resolveBaseUrl(): string {
  const candidate = PREVIEW_URL_CANDIDATES.find((value) => Boolean(value && value.trim()));
  if (!candidate) {
    return 'http://localhost:3000';
  }

  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }

  return `https://${candidate}`;
}

const baseURL = resolveBaseUrl();

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list']],
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
});
