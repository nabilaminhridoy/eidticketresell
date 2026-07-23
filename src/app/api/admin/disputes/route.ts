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
    if (status && status !== 'all') {
      where.status = status;
    }

    const [disputes, total] = await Promise.all([
      db.dispute.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, username: true } },
              seller: { select: { id: true, name: true, username: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dispute.count({ where }),
    ]);

    const disputeRecords = disputes.map(d => ({
      id: d.id,
      dspId: d.dspId,
      orderId: d.order.orderId,
      initiatedBy: d.initiatedBy,
      initiatorName: d.initiatedBy === 'buyer' ? d.order.buyer.name : d.order.seller.name,
      reason: d.reason,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      resolvedBy: d.resolvedBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      disputes: disputeRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin disputes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
