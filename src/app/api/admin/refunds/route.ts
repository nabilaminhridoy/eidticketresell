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

    const skip = (page - 1) * limit;

    // Query the Refund model with prefixed IDs
    const [refundRecords, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, username: true } },
              seller: { select: { id: true, name: true, username: true } },
              ticket: { select: { id: true, ticketId: true, transportType: true, routeFrom: true, routeTo: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.refund.count({ where }),
    ]);

    const refunds = refundRecords.map(r => ({
      id: r.id,
      refId: r.refId,
      orderId: r.order.orderId,
      initiatedBy: r.initiatedBy,
      buyerId: r.order.buyerId,
      buyerName: r.order.buyer.name,
      sellerId: r.order.sellerId,
      sellerName: r.order.seller.name,
      amount: r.amount,
      reason: r.reason,
      description: r.description,
      status: r.status,
      processNote: r.processNote,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      refunds,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin refunds error:', error);
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

    const { searchParams } = new URL(req.url);
    const refundId = searchParams.get('id');

    if (!refundId) {
      return NextResponse.json({ error: 'Refund ID is required as query parameter' }, { status: 400 });
    }

    const body = await req.json();
    const { status, processNote } = body;

    if (!status || !['completed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be either "completed" or "rejected"' }, { status: 400 });
    }

    const existingRefund = await db.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });

    if (!existingRefund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    // Update refund status
    const result = await db.$transaction(async (tx) => {
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: {
          status,
          processedBy: payload.id as string,
          processNote: processNote || null,
        },
      });

      // If refund is completed, update the order's escrow and payment status
      if (status === 'completed') {
        await tx.order.update({
          where: { id: existingRefund.orderId },
          data: {
            escrowStatus: 'refunded',
            paymentStatus: 'refunded',
          },
        });
      }

      return updatedRefund;
    });

    // Create notification for user
    const order = await db.order.findUnique({
      where: { id: existingRefund.orderId },
      include: { buyer: true, seller: true },
    });

    if (order) {
      await db.notification.create({
        data: {
          userId: existingRefund.initiatedBy === 'buyer' ? order.buyerId : order.sellerId,
          title: status === 'completed' ? 'Refund Completed' : 'Refund Rejected',
          message:
            status === 'completed'
              ? `Your refund of ৳${existingRefund.amount.toLocaleString()} for order ${order.orderId} has been completed.`
              : `Your refund request for order ${order.orderId} has been rejected. Reason: ${processNote || 'Please contact support.'}`,
          type: status === 'completed' ? 'success' : 'error',
        },
      });
    }

    return NextResponse.json({ refund: result });
  } catch (error) {
    console.error('Process refund error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
