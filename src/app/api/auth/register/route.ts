import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

// Allowed email domains
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com',
  'live.com', 'icloud.com', 'protonmail.com', 'proton.me',
  'yandex.com', 'zoho.com', 'mail.com', 'gmx.com',
  'aol.com', 'fastmail.com', 'tutanota.com',
];

// Bangladesh mobile number pattern: +88 followed by 11 digits starting with 01
const BD_PHONE_REGEX = /^\+8801[3-9]\d{8}$/;

// Password strength: at least 8 chars, uppercase, lowercase, number, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Username: lowercase letters, numbers, underscores, 3-20 chars
const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, username, password, gender, dateOfBirth, agreeAge, agreeTerms, agreeNotifications } = await req.json();

    // === Validation ===

    // Full Name
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required (at least 2 characters)' }, { status: 400 });
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Full name must be under 100 characters' }, { status: 400 });
    }

    // Username
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, lowercase letters/numbers/underscores, starting with a letter' },
        { status: 400 }
      );
    }

    // Email
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
      return NextResponse.json(
        { error: `Email domain not supported. Please use: ${ALLOWED_EMAIL_DOMAINS.slice(0, 5).join(', ')}, etc.` },
        { status: 400 }
      );
    }

    // Phone (Bangladesh format)
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!BD_PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be +88 followed by 11-digit Bangladesh number (e.g., +8801712345678)' },
        { status: 400 }
      );
    }

    // Gender
    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json({ error: 'Please select a valid gender' }, { status: 400 });
    }

    // Date of Birth
    if (!dateOfBirth) {
      return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    }
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      return NextResponse.json({ error: 'You must be at least 18 years old to register' }, { status: 400 });
    }

    // Password
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Agreements
    if (!agreeAge) {
      return NextResponse.json({ error: 'You must confirm you are at least 18 years old' }, { status: 400 });
    }
    if (!agreeTerms) {
      return NextResponse.json({ error: 'You must agree to the Terms & Conditions and Privacy Policy' }, { status: 400 });
    }

    // === Duplicate Checks ===

    const existingEmail = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const existingUsername = await db.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    // === Create User ===

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        phone,
        username,
        password: hashedPassword,
        gender,
        dateOfBirth,
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

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_registered',
        details: `New user registered with email: ${user.email}`,
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
