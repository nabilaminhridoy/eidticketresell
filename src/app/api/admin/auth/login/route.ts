import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = await db.admin.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = verifyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await db.admin.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });

    await db.adminActivityLog.create({
      data: { adminId: admin.id, action: 'admin_login', details: `Admin ${admin.email} logged in` },
    });

    return NextResponse.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, username: admin.username, phone: admin.phone, role: admin.role, avatar: admin.avatar },
      requireOtp: false,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
