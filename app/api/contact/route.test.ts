import assert from 'node:assert/strict';
import { after, describe, it, mock, before } from 'node:test';

let POST: typeof import('./route').POST;

describe('contact POST handler', () => {
  const originalEnv = { ...process.env };
  const envKeys = [
    'CONTACT_EMAIL',
    'CONTACT_PHONE',
    'NEXT_PUBLIC_SITE_URL',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
  ] as const;

  before(async () => {
    process.env.CONTACT_EMAIL = 'contact@example.com';
    process.env.CONTACT_PHONE = '+1 (555) 010-0000';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com';

    ({ POST } = await import('./route.js'));
  });

  after(() => {
    for (const key of envKeys) {
      const originalValue = originalEnv[key];
      if (typeof originalValue === 'string') {
        process.env[key] = originalValue;
      } else {
        delete process.env[key];
      }
    }
  });

  it('returns a generic success message without exposing contact details', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'user@example.com',
        phone: '+1 (555) 010-0000',
        message: 'Hello from the test suite!',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const infoMock = mock.method(console, 'info', () => undefined);
    const fetchMock = mock.method(globalThis, 'fetch', async () =>
      new Response('{}', { status: 200 }),
    );

    let response;
    try {
      response = await POST(request);
    } finally {
      infoMock.mock.restore();
      fetchMock.mock.restore();
    }

    const payload = await response.json();

    assert.equal(response.ok, true);
    assert.deepEqual(payload, {
      success: true,
      message: 'Contact request received.',
    });
    assert.equal('contactEmail' in payload, false);
    assert.equal(fetchMock.mock.calls.length, 1);
  });

  it('redacts payload details when logging the submission', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sensitive Name',
        email: 'sensitive@example.com',
        phone: '+44 20 7946 0123',
        message: 'Sensitive message',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const infoMock = mock.method(console, 'info', () => undefined);
    const fetchMock = mock.method(globalThis, 'fetch', async () =>
      new Response('{}', { status: 200 }),
    );

    try {
      await POST(request);

      const calls = infoMock.mock.calls;

      assert.equal(calls.length, 1);
      const [, logPayload] = calls[0].arguments;

      assert.deepEqual(logPayload, {
        meta: {
          contactEmail: 'contact@example.com',
          contactPhone: '+1 (555) 010-0000',
          siteUrl: 'https://example.com',
        },
        payload: {
          name: '[REDACTED]',
          email: '[REDACTED]',
          phone: '[REDACTED]',
          message: '[REDACTED]',
        },
      });
    } finally {
      infoMock.mock.restore();
      fetchMock.mock.restore();
    }

    assert.equal(fetchMock.mock.calls.length, 1);
  });
  it('rejects malformed payloads with a 400 response', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: '  ',
        email: 'invalid-email',
        phone: 'abc',
        message: 'short',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const warnMock = mock.method(console, 'warn', () => undefined);
    const errorMock = mock.method(console, 'error', () => undefined);
    const fetchMock = mock.method(globalThis, 'fetch', async () =>
      new Response('{}', { status: 200 }),
    );

    let response;
    try {
      response = await POST(request);
    } finally {
      warnMock.mock.restore();
      errorMock.mock.restore();
      fetchMock.mock.restore();
    }

    const payload = await response.json();

    assert.equal(response.ok, false);
    assert.equal(response.status, 400);
    assert.deepEqual(payload, {
      success: false,
      message: 'Invalid request payload.',
    });

    assert.equal(warnMock.mock.calls.length, 1);
    const [, logPayload] = warnMock.mock.calls[0].arguments;
    assert.deepEqual(logPayload, {
      reason: 'name is too short.',
    });
    assert.equal(errorMock.mock.calls.length, 0);
    assert.equal(fetchMock.mock.calls.length, 0);
  });

  it('returns a 500 response when request processing fails unexpectedly', async () => {
    const request = {
      async json() {
        throw new Error('boom');
      },
    } as unknown as Request;

    const errorMock = mock.method(console, 'error', () => undefined);

    let response;
    try {
      response = await POST(request);
    } finally {
      errorMock.mock.restore();
    }

    const payload = await response.json();

    assert.equal(response.ok, false);
    assert.equal(response.status, 500);
    assert.deepEqual(payload, {
      success: false,
      message: 'Unable to process contact request at this time.',
    });

    assert.equal(errorMock.mock.calls.length, 1);
  });

  it('returns a 502 response when the email provider rejects the request', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'user@example.com',
        phone: '+1 (555) 010-0000',
        message: 'Hello from the test suite!',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const fetchMock = mock.method(globalThis, 'fetch', async () =>
      new Response(JSON.stringify({ message: 'provider error' }), {
        status: 500,
      }),
    );
    const errorMock = mock.method(console, 'error', () => undefined);

    let response;
    try {
      response = await POST(request);
    } finally {
      fetchMock.mock.restore();
      errorMock.mock.restore();
    }

    const payload = await response.json();

    assert.equal(response.ok, false);
    assert.equal(response.status, 502);
    assert.deepEqual(payload, {
      success: false,
      message: 'Unable to deliver contact request. Please try again later.',
    });

    assert.equal(errorMock.mock.calls.length, 1);
    const [, errorMetadata] = errorMock.mock.calls[0].arguments;
    assert.deepEqual(errorMetadata, { reason: 'provider error' });
    assert.equal(fetchMock.mock.calls.length, 1);
  });
});
