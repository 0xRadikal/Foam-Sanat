/**
 * Contact form endpoint (POST /api/contact)
 *
 * Environment variables:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: public key for the Turnstile widget (client)
 * - TURNSTILE_SECRET_KEY: secret key for Turnstile verification (server)
 * - DATABASE_URL: Prisma connection string
 *
 * Turnstile setup: Cloudflare dashboard → Turnstile → Create Widget → copy site & secret keys.
 * Place the site key in NEXT_PUBLIC_TURNSTILE_SITE_KEY and the secret key in TURNSTILE_SECRET_KEY.
 * Run `npx prisma migrate dev` to apply schema changes locally and `npx prisma studio` to inspect data.
 *
 * Note: If the frontend is hosted on a different domain, configure CORS headers for this route.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { rateLimitByIp } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Please provide a valid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  turnstileToken: z.string().min(1, 'Turnstile token is required.'),
});

type ContactPayload = z.infer<typeof contactSchema>;

const ONE_MINUTE_MS = 60_000;

function extractClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',').map((part) => part.trim()).find(Boolean);
    if (ip) {
      return ip;
    }
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  return undefined;
}

function buildValidationError(error: z.ZodError<ContactPayload>) {
  return error.format();
}

export async function POST(req: Request) {
  let parsedBody: ContactPayload;

  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation',
          details: buildValidationError(result.error),
        },
        { status: 400 },
      );
    }
    parsedBody = result.data;
  } catch (parseError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation',
        details: { message: 'Invalid JSON payload.' },
      },
      { status: 400 },
    );
  }

  const clientIp = extractClientIp(req) ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  const rateLimit = rateLimitByIp(clientIp, { limit: 1, windowMs: ONE_MINUTE_MS });
  if (!rateLimit.ok) {
    return NextResponse.json(
      {
        success: false,
        error: 'RateLimit',
        details: { retryAfter: rateLimit.retryAfterMs },
      },
      { status: 429, headers: rateLimit.retryAfterHeader },
    );
  }

  try {
    const remoteIp = clientIp === 'unknown' ? undefined : clientIp;
    const turnstileResponse = await verifyTurnstileToken(parsedBody.turnstileToken, remoteIp);
    if (!turnstileResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Captcha',
          details: { reason: turnstileResponse['error-codes'] ?? 'Verification failed.' },
        },
        { status: 401 },
      );
    }

    const record = await prisma.contactMessage.create({
      data: {
        name: parsedBody.name,
        email: parsedBody.email,
        message: parsedBody.message,
        ip: clientIp === 'unknown' ? null : clientIp,
        userAgent,
      },
      select: { id: true },
    });
    // Integrate downstream workflows here (email notifications, CRM sync, etc.).

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error('Contact form submission failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
      level: process.env.LOG_LEVEL ?? 'info',
      note: 'Add structured logging / Sentry here in production.',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ServerError',
        details: { message: 'Unable to process request.' },
      },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';

// Example curl (Turnstile token must be generated client-side and will expire quickly):
// curl -X POST http://localhost:3000/api/contact \
//   -H 'Content-Type: application/json' \
//   -d '{"name":"Ada Lovelace","email":"ada@example.com","message":"Hello from curl!","turnstileToken":"<valid-token>"}'
