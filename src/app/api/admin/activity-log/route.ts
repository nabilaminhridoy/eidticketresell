import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const activities = await db.adminActivityLog.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
    });

    const total = await db.adminActivityLog.count();

    const enrichedActivities = activities.map(a => ({
      id: a.id,
      action: a.action,
      details: a.details,
      ipAddress: a.ipAddress,
      createdAt: a.createdAt.toISOString(),
      admin: a.admin ? { name: a.admin.name || a.admin.username || a.admin.email } : null,
      adminId: a.adminId,
    }));

    return NextResponse.json({ activities: enrichedActivities, total, page, limit });
  } catch (error) {
    console.error('Admin activity log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
