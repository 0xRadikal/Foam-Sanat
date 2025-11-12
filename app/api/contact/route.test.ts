import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { POST } from './route';

describe('contact POST handler', () => {
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

    let response;
    try {
      response = await POST(request);
    } finally {
      infoMock.mock.restore();
    }

    const payload = await response.json();

    assert.equal(response.ok, true);
    assert.deepEqual(payload, {
      success: true,
      message: 'Contact request received.',
    });
    assert.equal('contactEmail' in payload, false);
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

    try {
      await POST(request);

      const calls = infoMock.mock.calls;

      assert.equal(calls.length, 1);
      const [, logPayload] = calls[0].arguments;

      assert.deepEqual(logPayload, {
        meta: {
          contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@foamsanat.com',
          contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+989197302064',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foamsanat.com',
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
    }
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

    let response;
    try {
      response = await POST(request);
    } finally {
      warnMock.mock.restore();
      errorMock.mock.restore();
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
});
