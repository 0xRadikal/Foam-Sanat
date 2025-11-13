const submissions = new Map<string, { count: number; expiresAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS = 5;

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = submissions.get(identifier);
  if (!entry || entry.expiresAt < now) {
    submissions.set(identifier, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_SUBMISSIONS) {
    return true;
  }

  entry.count += 1;
  submissions.set(identifier, entry);
  return false;
}
