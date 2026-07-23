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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      db.journeyVerification.findMany({
        where,
        include: {
          order: {
            select: {
              id: true, orderId: true, status: true, deliveryMethod: true,
              buyer: { select: { id: true, name: true, username: true, avatar: true } },
              seller: { select: { id: true, name: true, username: true, avatar: true } },
              ticket: { select: { ticketId: true, transportType: true, routeFrom: true, routeTo: true, departureDate: true, price: true } },
            },
          },
          buyer: { select: { id: true, name: true, username: true, avatar: true, phone: true } },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.journeyVerification.count({ where }),
    ]);

    // Calculate escrow release times
    const enriched = verifications.map((v) => ({
      ...v,
      escrowReleaseTime: v.submittedAt ? new Date(new Date(v.submittedAt).getTime() + 12 * 60 * 60 * 1000).toISOString() : null,
      hoursUntilRelease: v.submittedAt ? Math.max(0, Math.round((new Date(new Date(v.submittedAt).getTime() + 12 * 60 * 60 * 1000).getTime() - Date.now()) / (1000 * 60 * 60))) : null,
    }));

    return NextResponse.json({
      verifications: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        total: total,
        pending: await db.journeyVerification.count({ where: { status: 'pending' } }),
        submitted: await db.journeyVerification.count({ where: { status: 'submitted' } }),
        verified: await db.journeyVerification.count({ where: { status: 'verified' } }),
        rejected: await db.journeyVerification.count({ where: { status: 'rejected' } }),
      },
    });
  } catch (error) {
    console.error('Get journey verifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
