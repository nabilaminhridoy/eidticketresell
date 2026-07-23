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
    const status = searchParams.get('status');
    const transportType = searchParams.get('transportType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (transportType && transportType !== 'all') {
      where.transportType = transportType;
    }

    if (search) {
      where.OR = [
        { ticketId: { contains: search, mode: 'insensitive' } },
        { transportCompany: { contains: search, mode: 'insensitive' } },
        { routeFrom: { contains: search, mode: 'insensitive' } },
        { routeTo: { contains: search, mode: 'insensitive' } },
        { pnrNumber: { contains: search, mode: 'insensitive' } },
        { seller: { name: { contains: search, mode: 'insensitive' } } },
        { seller: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        include: {
          seller: {
            select: { id: true, name: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.ticket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
