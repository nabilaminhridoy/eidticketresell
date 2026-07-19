import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, phone, type } = await req.json();

    // type: email_verification, phone_verification, login, forgot_password
    if (!type || !['email_verification', 'phone_verification', 'login', 'forgot_password'].includes(type)) {
      return NextResponse.json({ error: 'Invalid OTP type' }, { status: 400 });
    }

    if (type === 'email_verification' || type === 'forgot_password') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }

      // For registration, check if email already exists (except forgot_password)
      if (type === 'email_verification') {
        const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (exists) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }
      }

      // For forgot_password, check if email exists
      if (type === 'forgot_password') {
        const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!exists) {
          return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
        }
      }
    }

    if (type === 'phone_verification' || type === 'login') {
      if (!phone && !email) {
        return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
      }
      if (phone) {
        const BD_PHONE_REGEX = /^\+8801[3-9]\d{8}$/;
        if (!BD_PHONE_REGEX.test(phone)) {
          return NextResponse.json({ error: 'Invalid Bangladesh phone number' }, { status: 400 });
        }
      }
    }

    // Check rate limiting - max 3 OTPs in 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOtps = await db.otpVerification.findMany({
      where: {
        email: email?.toLowerCase() || undefined,
        phone: phone || undefined,
        type,
        createdAt: { gt: tenMinutesAgo },
      },
    });

    if (recentOtps.length >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await db.otpVerification.create({
      data: {
        email: email?.toLowerCase() || null,
        phone: phone || null,
        otp,
        type,
        expiresAt,
      },
    });

    // In production, send actual email/SMS here
    // For development, we return the OTP in response
    console.log(`[OTP] Type: ${type}, Email: ${email}, Phone: ${phone}, OTP: ${otp}`);

    return NextResponse.json({
      message: 'OTP sent successfully',
      // In production, remove the otp field from response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      expiresAt,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
