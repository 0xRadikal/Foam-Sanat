import { NextResponse } from 'next/server';

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@foamsanat.com';
const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+989197302064';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foamsanat.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Contact form submission received', {
      meta: {
        contactEmail: CONTACT_EMAIL,
        contactPhone: CONTACT_PHONE,
        siteUrl: SITE_URL,
      },
      payload: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Contact request received.',
      contactEmail: CONTACT_EMAIL,
    });
  } catch (error) {
    console.error('Failed to process contact form submission:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request payload.',
      },
      { status: 400 },
    );
  }
}
