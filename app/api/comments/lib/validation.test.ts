import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validateCommentPayload } from './validation';

const basePayload = {
  productId: 'abc-123',
  rating: 5,
  author: 'Test User',
  email: 'USER@Email.COM',
  text: 'This is a sufficiently long comment that should be accepted.',
  turnstileToken: '   token-value   ',
};

describe('validateCommentPayload', () => {
  it('returns sanitized payload with normalized fields', () => {
    const result = validateCommentPayload(basePayload);

    assert.equal(result.error, null);
    assert.deepEqual(result.sanitized, {
      productId: 'abc-123',
      rating: 5,
      author: 'Test User',
      email: 'user@email.com',
      text: 'This is a sufficiently long comment that should be accepted.',
      turnstileToken: 'token-value',
    });
  });

  it('rejects invalid ratings and missing fields', () => {
    const result = validateCommentPayload({ ...basePayload, rating: 7 });

    assert.equal(result.error, 'Rating must be an integer between 1 and 5.');
    assert.equal(result.sanitized, undefined);
  });

  it('rejects comments with excessive links or too-short content', () => {
    const result = validateCommentPayload({
      ...basePayload,
      text: 'link1 https://one.com link2 https://two.com link3 https://three.com',
    });

    assert.equal(result.error, 'Please remove excessive links from your comment.');
  });

  it('clears empty turnstile tokens from the sanitized payload', () => {
    const result = validateCommentPayload({ ...basePayload, turnstileToken: '   ' });

    assert.equal(result.error, null);
    assert.equal(result.sanitized?.turnstileToken, undefined);
  });
});
