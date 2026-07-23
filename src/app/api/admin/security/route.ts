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
    const section = searchParams.get('section') || 'login-history';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (section === 'login-history') {
      // Fetch admin activity logs for login actions
      const activities = await db.adminActivityLog.findMany({
        where: {
          action: { contains: 'login' },
        },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await db.adminActivityLog.count({
        where: { action: { contains: 'login' } },
      });

      const loginRecords = activities.map(a => ({
        id: a.id,
        user: a.admin?.email || a.details || 'Unknown',
        ip: a.ipAddress || 'N/A',
        location: 'N/A',
        time: a.createdAt.toISOString(),
        status: a.action.includes('failed') ? 'failed' : 'success',
      }));

      return NextResponse.json({
        loginHistory: loginRecords,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (section === 'activity') {
      // General admin activity
      const activities = await db.adminActivityLog.findMany({
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await db.adminActivityLog.count();

      return NextResponse.json({
        activities: activities.map(a => ({
          id: a.id,
          adminName: a.admin?.name || 'Unknown',
          adminEmail: a.admin?.email || 'Unknown',
          action: a.action,
          details: a.details,
          ipAddress: a.ipAddress || 'N/A',
          createdAt: a.createdAt.toISOString(),
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Default: return all admin activity logs
    const allActivities = await db.adminActivityLog.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      activities: allActivities.map(a => ({
        id: a.id,
        adminName: a.admin?.name || 'Unknown',
        action: a.action,
        details: a.details,
        ipAddress: a.ipAddress || 'N/A',
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get admin security error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
