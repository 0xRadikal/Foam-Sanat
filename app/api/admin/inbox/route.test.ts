import { describe, expect, it } from 'vitest';
import { InboxType } from '@prisma/client';
import { buildInboxWhere } from './route';

describe('buildInboxWhere', () => {
  it('builds filters for type, product, and status flags', () => {
    const params = new URLSearchParams({
      type: InboxType.COMMENT,
      productId: 'prod-123',
      spam: 'false',
      unread: 'true',
      unresolved: 'true',
    });

    expect(buildInboxWhere(params)).toEqual({
      type: InboxType.COMMENT,
      productId: 'prod-123',
      isSpam: false,
      isRead: false,
      isResolved: false,
    });
  });

  it('builds date range filters when provided', () => {
    const params = new URLSearchParams({
      from: '2024-01-01T00:00:00.000Z',
      to: '2024-01-31T23:59:59.000Z',
    });

    const where = buildInboxWhere(params);
    expect(where.createdAt?.gte?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(where.createdAt?.lte?.toISOString()).toBe('2024-01-31T23:59:59.000Z');
  });

  it('ignores empty filters', () => {
    const params = new URLSearchParams();
    expect(buildInboxWhere(params)).toEqual({});
  });
});
