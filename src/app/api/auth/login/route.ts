import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, otp } = await req.json();

    // identifier can be email, phone, or username
    if (!identifier) {
      return NextResponse.json(
        { error: 'Please enter your phone, email, or username' },
        { status: 400 }
      );
    }

    // If using OTP login (no password)
    if (otp && !password) {
      const otpRecord = await db.otpVerification.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
          type: 'login',
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord || otpRecord.otp !== otp) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
      }

      // Mark OTP as verified
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      // Find user by email or phone
      const user = await db.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { phone: identifier },
            { username: identifier.toLowerCase() },
          ],
          isDeleted: false,
          isActive: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isKycVerified: user.isKycVerified,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
        token,
      });
    }

    // Password-based login
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Find user by email, phone, or username
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
          { username: identifier.toLowerCase() },
        ],
        isDeleted: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_login',
        details: 'User logged in successfully',
      },
    });

    // Create login notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'New Login',
        message: 'Your account was just logged in. If this wasn\'t you, please change your password immediately.',
        type: 'info',
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        isKycVerified: user.isKycVerified,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
