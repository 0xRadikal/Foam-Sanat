import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { recordAuditLog } from '../audit';
import { consumeRateLimit } from '../rate-limit';

type AuthOptionsType = {
  adapter: unknown;
  session: { strategy: 'jwt'; maxAge?: number };
  pages: { signIn: string };
  providers: unknown[];
  callbacks: {
    jwt: (params: { token: JWT; user?: { role?: string } }) => Promise<JWT>;
    session: (params: { session: Session; token: JWT }) => Promise<Session>;
  };
  csrf?: { csrfTokenCookie?: { secure?: boolean } };
  secret?: string;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const authOptions: AuthOptionsType = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? '';

        if (!email || !password) {
          return null;
        }

        const forwardedFor = request?.headers?.['x-forwarded-for'] ?? request?.headers?.get?.('x-forwarded-for');
        const ip =
          (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ??
          request?.headers?.['x-real-ip'] ??
          request?.headers?.get?.('x-real-ip') ??
          null;
        const ua = request?.headers?.['user-agent'] ?? request?.headers?.get?.('user-agent') ?? undefined;

        const limit = consumeRateLimit(`login:${ip ?? 'unknown'}`, 8, 15 * 60 * 1000);
        if (!limit.allowed) {
          await recordAuditLog({
            actorId: null,
            action: 'login.rate_limited',
            entityType: 'user',
            entityId: null,
            ip: ip ?? undefined,
            userAgent: ua,
          });
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          await recordAuditLog({
            actorId: null,
            action: 'login.failed',
            entityType: 'user',
            entityId: null,
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: ua,
            diff: { reason: 'unknown-user', email },
          });
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await recordAuditLog({
            actorId: user.id,
            action: 'login.locked',
            entityType: 'user',
            entityId: user.id,
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: ua,
          });
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          const failedAttempts = user.failedLoginAttempts + 1;
          const lockedUntil =
            failedAttempts >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
              : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockedUntil,
            },
          });

          await recordAuditLog({
            actorId: user.id,
            action: 'login.failed',
            entityType: 'user',
            entityId: user.id,
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: ua,
            diff: { reason: 'invalid-password' },
          });

          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        await recordAuditLog({
          actorId: user.id,
          action: 'login.success',
          entityType: 'user',
          entityId: user.id,
          ip: Array.isArray(ip) ? ip[0] : ip,
          userAgent: ua,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: { role?: string } }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = (token as { role?: string }).role ?? 'ADMIN';
      }
      session.csrfToken = (token as { jti?: string }).jti;
      return session;
    },
  },
  csrf: {
    // We layer an app-specific double-submit token through middleware; NextAuth csrf covers login
    csrfTokenCookie: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  secret: process.env.AUTH_SECRET,
};
