import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

export type AdminSession = Session & { user: { id: string; role: string; email?: string | null; name?: string | null } };

export async function requireSession(): Promise<AdminSession> {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session || !session.user?.id || !session.user.role) {
    throw new Error('UNAUTHORIZED');
  }
  return session as AdminSession;
}
