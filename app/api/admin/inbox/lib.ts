import { InboxType, Prisma } from '@prisma/client';

export function buildInboxWhere(params: URLSearchParams): Prisma.InboxItemWhereInput {
  const type = params.get('type') as InboxType | null;
  const productId = params.get('productId');
  const spam = params.get('spam');
  const unresolved = params.get('unresolved');
  const unread = params.get('unread');
  const dateFrom = params.get('from');
  const dateTo = params.get('to');

  return {
    ...(type ? { type } : {}),
    ...(productId ? { productId } : {}),
    ...(spam === 'true' ? { isSpam: true } : spam === 'false' ? { isSpam: false } : {}),
    ...(unread === 'true' ? { isRead: false } : unread === 'false' ? { isRead: true } : {}),
    ...(unresolved === 'true' ? { isResolved: false } : unresolved === 'false' ? { isResolved: true } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined,
          },
        }
      : {}),
  };
}
