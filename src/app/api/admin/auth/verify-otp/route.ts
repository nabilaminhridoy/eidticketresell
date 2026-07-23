import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    // In production, verify OTP from OtpVerification table
    // For now, accept any 6-digit OTP
    if (otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Admin OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
