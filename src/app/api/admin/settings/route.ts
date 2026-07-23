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
    const group = searchParams.get('group') || 'all';

    const where: Record<string, unknown> = {};
    if (group && group !== 'all') {
      where.group = group;
    }

    const settings = await db.setting.findMany({ where, orderBy: { key: 'asc' } });

    return NextResponse.json({
      settings: settings.map(s => ({
        id: s.id,
        key: s.key,
        value: s.value,
        group: s.group,
      })),
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { settings } = body as { settings: { key: string; value: string; group: string }[] };

    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, group: setting.group },
        create: { key: setting.key, value: setting.value, group: setting.group },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
