import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validateCommentPayload } from './validation';

describe('validateCommentPayload', () => {
  const basePayload = {
    productId: 'machine-1',
    rating: 5,
    author: 'Test User',
    email: 'USER@Example.COM',
    text: 'This machine worked very well for our use case. Great quality!',
  };

  it('sanitizes valid payloads and normalizes fields', () => {
    const result = validateCommentPayload({ ...basePayload, turnstileToken: ' token ' });

    assert.equal(result.error, null);
    assert.ok(result.sanitized);
    assert.equal(result.sanitized?.email, 'user@example.com');
    assert.equal(result.sanitized?.turnstileToken, 'token');
  });

  it('rejects ratings outside the allowed integer range', () => {
    const result = validateCommentPayload({ ...basePayload, rating: 6 });

    assert.equal(result.error, 'Rating must be an integer between 1 and 5.');
    assert.equal(result.sanitized, undefined);
  });

  it('flags comments with too many links as spammy', () => {
    const textWithLinks =
      'Check https://example.com and https://example.org plus https://example.net for details';
    const result = validateCommentPayload({ ...basePayload, text: textWithLinks });

    assert.equal(result.error, 'Please remove excessive links from your comment.');
  });
});
