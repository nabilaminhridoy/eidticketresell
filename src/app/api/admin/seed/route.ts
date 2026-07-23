import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if super_admin already exists
    const existing = await db.admin.findFirst({ where: { role: 'super_admin' } });

    if (existing) {
      return NextResponse.json({ message: 'Super admin already exists', admin: { email: existing.email, name: existing.name } });
    }

    // Create super admin
    const hashedPassword = await hashPassword('admin123');

    const admin = await db.admin.create({
      data: {
        email: 'admin@eidticketresell.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Super admin created successfully',
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      credentials: { email: 'admin@eidticketresell.com', password: 'admin123' },
    });
  } catch (error) {
    console.error('Admin seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
