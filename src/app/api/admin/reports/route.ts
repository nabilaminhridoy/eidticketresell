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
    const type = searchParams.get('type') || 'sales';

    // Sales report data
    const totalOrders = await db.order.count();
    const completedOrders = await db.order.count({ where: { status: 'completed' } });
    const cancelledOrders = await db.order.count({ where: { status: 'cancelled' } });
    const disputedOrders = await db.order.count({ where: { status: 'disputed' } });

    const paidOrders = await db.order.findMany({ where: { paymentStatus: 'paid' } });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPlatformFee = paidOrders.reduce((sum, o) => sum + o.platformFee, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // User stats
    const totalUsers = await db.user.count({ where: { isDeleted: false } });
    const activeUsers = await db.user.count({ where: { isActive: true, isDeleted: false } });

    // Ticket stats
    const totalTickets = await db.ticket.count();
    const activeTickets = await db.ticket.count({ where: { status: 'active' } });
    const soldTickets = await db.ticket.count({ where: { status: 'sold' } });

    // Withdrawal stats
    const pendingWithdrawals = await db.withdrawal.count({ where: { status: 'pending' } });
    const completedWithdrawals = await db.withdrawal.count({ where: { status: 'completed' } });
    const totalWithdrawn = await db.withdrawal.findMany({ where: { status: 'completed' } });
    const totalWithdrawnAmount = totalWithdrawn.reduce((sum, w) => sum + w.amount, 0);

    // KYC stats
    const pendingKyc = await db.kyc.count({ where: { status: 'pending' } });
    const approvedKyc = await db.kyc.count({ where: { status: 'approved' } });
    const rejectedKyc = await db.kyc.count({ where: { status: 'rejected' } });

    // Refund stats
    const refundedOrders = await db.order.findMany({
      where: { OR: [{ paymentStatus: 'refunded' }, { escrowStatus: 'refunded' }] },
    });
    const totalRefunded = refundedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const data = {
      sales: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        disputedOrders,
        totalRevenue,
        avgOrderValue,
      },
      revenue: {
        totalRevenue,
        totalPlatformFee,
        totalRefunded,
        netRevenue: totalPlatformFee,
      },
      users: {
        totalUsers,
        activeUsers,
        pendingKyc,
        approvedKyc,
        rejectedKyc,
      },
      tickets: {
        totalTickets,
        activeTickets,
        soldTickets,
      },
      payments: {
        paidTransactions: paidOrders.length,
        totalRevenue,
        totalPlatformFee,
      },
      refunds: {
        totalRefunds: refundedOrders.length,
        totalRefunded,
      },
      withdrawals: {
        pendingWithdrawals,
        completedWithdrawals,
        totalWithdrawnAmount,
      },
    };

    // Return data based on type
    const reportData = type === 'all' ? data : data[type as keyof typeof data] || data.sales;

    return NextResponse.json({ report: reportData, type });
  } catch (error) {
    console.error('Get admin reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
