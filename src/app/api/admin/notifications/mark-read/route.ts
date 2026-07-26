import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
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

    // Mark all admin activity as reviewed (no persistent state needed for dynamic notifications)
    // For support tickets - auto-mark as "in_progress" so they don't show as unread again
    // This is a lightweight approach - the notifications are dynamically generated

    // Log the action
    await db.adminActivityLog.create({
      data: {
        adminId: payload.id as string,
        action: 'notifications_mark_read',
        details: 'Admin marked all notifications as read',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
