import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'user',
      },
    });

    // Create wallet for new user
    await db.wallet.create({
      data: {
        userId: user.id,
        availableBalance: 0,
        pendingBalance: 0,
        escrowBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
      },
    });

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Eid Ticket Resell!',
        message: 'Your account has been created successfully. Start buying or selling tickets today!',
        type: 'success',
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isKycVerified: user.isKycVerified,
          avatar: user.avatar,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
