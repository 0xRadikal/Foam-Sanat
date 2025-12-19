import NextAuth from 'next-auth/next';
import { authOptions } from '@/app/lib/auth/options';

// @ts-expect-error runtime supports options-only signature
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
