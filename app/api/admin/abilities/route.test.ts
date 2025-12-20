import { AbilityType } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { buildValuePayload } from './utils';

const emptyOptions: { id: string; value: string }[] = [];

describe('buildValuePayload', () => {
  it('throws on inverted ranges', () => {
    expect(() => buildValuePayload(AbilityType.RANGE, { rangeStart: 20, rangeEnd: 10 }, emptyOptions)).toThrow('INVALID_VALUE');
  });

  it('throws on missing enum option', () => {
    expect(() => buildValuePayload(AbilityType.ENUM, { abilityOptionId: 'missing' }, emptyOptions)).toThrow('INVALID_VALUE');
  });

  it('accepts numeric values', () => {
    const payload = buildValuePayload(AbilityType.NUMBER, { valueNumber: 5 }, emptyOptions);
    expect(payload.valueNumber?.toString()).toBe('5');
  });
});
