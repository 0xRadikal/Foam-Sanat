import { NextResponse } from 'next/server';

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@foamsanat.com';
const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+989197302064';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foamsanat.com';

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

class InvalidContactPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidContactPayloadError';
  }
}

function isInvalidPayloadError(error: unknown): boolean {
  return (
    error instanceof InvalidContactPayloadError || error instanceof SyntaxError
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unknown error';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactPayload = parseContactPayload(body);

    console.info('Contact form submission received', {
      meta: {
        contactEmail: CONTACT_EMAIL,
        contactPhone: CONTACT_PHONE,
        siteUrl: SITE_URL,
      },
      payload: redactPayload(contactPayload),
    });

    return NextResponse.json({
      success: true,
      message: 'Contact request received.',
    });
  } catch (error) {
    if (isInvalidPayloadError(error)) {
      console.warn('Rejected invalid contact form submission', {
        reason: getErrorMessage(error),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request payload.',
        },
        { status: 400 },
      );
    }

    console.error('Failed to process contact form submission:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process contact request at this time.',
      },
      { status: 500 },
    );
  }
}

function parseContactPayload(payload: unknown): ContactPayload {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidContactPayloadError('Payload must be an object.');
  }

  const { name, email, phone, message } = payload as Record<string, unknown>;

  const sanitizedName = sanitizeRequiredString(name, 'name', 100);
  const sanitizedEmail = sanitizeRequiredString(email, 'email', 254);
  const sanitizedPhone = sanitizeRequiredString(phone, 'phone', 30);
  const sanitizedMessage = sanitizeRequiredString(message, 'message', 2000, 10);

  if (!isValidEmail(sanitizedEmail)) {
    throw new InvalidContactPayloadError('Email format is invalid.');
  }

  if (!isValidPhone(sanitizedPhone)) {
    throw new InvalidContactPayloadError('Phone format is invalid.');
  }

  return {
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    message: sanitizedMessage,
  };
}

function sanitizeRequiredString(
  value: unknown,
  field: string,
  maxLength: number,
  minLength = 1,
): string {
  if (typeof value !== 'string') {
    throw new InvalidContactPayloadError(`${field} must be a string.`);
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    throw new InvalidContactPayloadError(`${field} is too short.`);
  }

  if (trimmed.length > maxLength) {
    throw new InvalidContactPayloadError(`${field} exceeds allowed length.`);
  }

  return trimmed;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

function redactPayload(payload: unknown): Record<string, string> | string {
  if (!payload || typeof payload !== 'object') {
    return '[REDACTED]';
  }

  const entries = Object.keys(payload as Record<string, unknown>).map(
    (key) => [key, '[REDACTED]'] as const,
  );

  return Object.fromEntries(entries);
}
