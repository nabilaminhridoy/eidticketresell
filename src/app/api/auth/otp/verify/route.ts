import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp, type } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: 'OTP code is required' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'OTP type is required' }, { status: 400 });
    }

    // Find the most recent unverified OTP
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email: email?.toLowerCase() || undefined,
        phone: phone || undefined,
        type,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // If this is email/phone verification for an existing user, update their status
    if (type === 'email_verification' && email) {
      const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (user) {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }
    }

    if (type === 'phone_verification' && phone) {
      const user = await db.user.findUnique({ where: { phone } });
      if (user) {
        await db.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      }
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
