import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { defaultLocale, locales } from './i18n/locales';
import { resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('returns the provided locale when supported', () => {
    locales.forEach((locale) => {
      assert.equal(resolveLocale(locale), locale);
    });
  });

  it('falls back to the default locale when value is missing', () => {
    assert.equal(resolveLocale(), defaultLocale);
  });

  it('falls back to the default locale when value is not supported', () => {
    const invalidLocale = 'es';
    assert.equal(resolveLocale(invalidLocale), defaultLocale);
  });
});
