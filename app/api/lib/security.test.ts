import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { getAllowedOrigins } from './security';

const ORIGINAL_ENV = { ...process.env };

describe('security allowlist', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('includes preview URLs provided via environment variables', () => {
    process.env.PREVIEW_URL = 'https://preview.example.com';
    process.env.NEXT_PUBLIC_PREVIEW_URL = 'https://public-preview.example.com';

    const allowed = getAllowedOrigins();

    assert(allowed.has('https://preview.example.com'));
    assert(allowed.has('https://public-preview.example.com'));
    assert(allowed.has('http://preview.example.com'));
    assert(allowed.has('http://public-preview.example.com'));
  });
});
