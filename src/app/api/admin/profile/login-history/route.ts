import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const adminId = payload.id as string;

    // Get all activity logs for this admin (login-related actions)
    const [logs, total] = await Promise.all([
      db.adminActivityLog.findMany({
        where: {
          adminId,
          action: { in: ['admin_login', 'password_change', 'profile_update', '2fa_enabled', '2fa_disabled', 'logout'] },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.adminActivityLog.count({
        where: {
          adminId,
          action: { in: ['admin_login', 'password_change', 'profile_update', '2fa_enabled', '2fa_disabled', 'logout'] },
        },
      }),
    ]);

    // Also get the admin's lastLogin info
    const admin = await db.admin.findUnique({ where: { id: adminId } });

    const loginHistory = logs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      timestamp: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      loginHistory,
      lastLogin: admin?.lastLogin?.toISOString() || null,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin login history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
