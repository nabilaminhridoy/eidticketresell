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

    // Find orders with refunded status
    const where = {
      OR: [
        { escrowStatus: 'refunded' },
        { paymentStatus: 'refunded' },
        { status: 'cancelled' },
      ],
    };

    const [refunds, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, username: true } },
          seller: { select: { id: true, name: true, username: true } },
          ticket: { select: { id: true, ticketId: true, transportType: true, routeFrom: true, routeTo: true } },
          dispute: { select: { id: true, reason: true, status: true, resolution: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const refundRecords = refunds.map(order => ({
      id: order.id,
      orderId: order.orderId,
      buyerId: order.buyerId,
      buyerName: order.buyer.name,
      sellerId: order.sellerId,
      sellerName: order.seller.name,
      amount: order.amount,
      reason: order.dispute?.reason || 'Order cancelled/refunded',
      status: order.paymentStatus === 'refunded' ? 'completed' : order.escrowStatus === 'refunded' ? 'processing' : 'pending',
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      refunds: refundRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin refunds error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
