import { NextResponse } from 'next/server';

import { sanitizeStringField, redactPayload } from '../lib/payload';
import { validateRequestOrigin, verifyTurnstileToken } from '../lib/security';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'info@foamsanat.com';
const CONTACT_PHONE = process.env.CONTACT_PHONE ?? '+989197302064';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foamsanat.com';
const RESEND_API_URL = 'https://api.resend.com/emails';

class EmailProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailProviderError';
  }
}

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  turnstileToken?: string;
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

function isEmailProviderError(error: unknown): error is EmailProviderError {
  return error instanceof EmailProviderError;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unknown error';
}

export async function POST(request: Request) {
  try {
    const originError = validateRequestOrigin(request);
    if (originError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request origin.',
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const contactPayload = parseContactPayload(body);

    const captchaError = await verifyTurnstileToken(
      contactPayload.turnstileToken ?? request.headers.get('cf-turnstile-response'),
    );

    if (captchaError) {
      return NextResponse.json(
        {
          success: false,
          message: captchaError,
        },
        { status: 403 },
      );
    }

    console.info('Contact form submission received', {
      meta: {
        contactEmail: CONTACT_EMAIL,
        contactPhone: CONTACT_PHONE,
        siteUrl: SITE_URL,
      },
      payload: redactPayload(contactPayload),
    });

    await forwardContactSubmission(contactPayload);

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

    if (isEmailProviderError(error)) {
      console.error('Failed to forward contact form submission to provider', {
        reason: error.message,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Unable to deliver contact request. Please try again later.',
        },
        { status: 502 },
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

  const { name, email, phone, message, turnstileToken } = payload as Record<
    string,
    unknown
  >;

  const sanitizedName = sanitizeRequiredContactField(name, 'name', 100);
  const sanitizedEmail = sanitizeRequiredContactField(email, 'email', 254);
  const sanitizedPhone = sanitizeRequiredContactField(phone, 'phone', 30);
  const sanitizedMessage = sanitizeRequiredContactField(message, 'message', 2000, 10);

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
    turnstileToken:
      typeof turnstileToken === 'string' && turnstileToken.trim().length > 0
        ? turnstileToken.trim()
        : undefined,
  };
}

function sanitizeRequiredContactField(
  value: unknown,
  field: string,
  maxLength: number,
  minLength = 1,
): string {
  const result = sanitizeStringField(value, {
    fieldName: field,
    maxLength,
    minLength,
  });

  if (!result.ok) {
    throw new InvalidContactPayloadError(result.error);
  }

  return result.value;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

async function forwardContactSubmission(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailProviderError('Email provider API key is not configured.');
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? CONTACT_EMAIL;
  const toAddress = CONTACT_EMAIL;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toAddress],
      subject: `New contact form submission from ${payload.name}`,
      text: formatPlaintextMessage(payload),
    }),
  });

  if (!response.ok) {
    let errorMessage = `Email provider responded with status ${response.status}`;

    try {
      const errorPayload = await response.json();
      const detail = errorPayload?.message ?? errorPayload?.error;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        errorMessage = detail;
      }
    } catch (jsonError) {
      const message = getErrorMessage(jsonError);
      errorMessage = `${errorMessage}; failed to parse error response: ${message}`;
    }

    throw new EmailProviderError(errorMessage);
  }
}

function formatPlaintextMessage(payload: ContactPayload): string {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    '',
    payload.message,
    '',
    `Submitted from: ${SITE_URL}`,
  ];

  return lines.join('\n');
}
