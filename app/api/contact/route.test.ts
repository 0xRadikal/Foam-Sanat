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
        message: 'Hello',
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
          message: '[REDACTED]',
        },
      });
    } finally {
      infoMock.mock.restore();
    }
  });
});
