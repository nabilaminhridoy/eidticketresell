import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalUsers = await db.user.count({ where: { isDeleted: false } });
    const activeTickets = await db.ticket.count({ where: { status: 'active' } });
    const totalTickets = await db.ticket.count();
    const totalOrders = await db.order.count();
    const pendingKyc = await db.kyc.count({ where: { status: 'pending' } });
    const pendingWithdrawals = await db.withdrawal.count({ where: { status: 'pending' } });
    const disputesOpen = await db.dispute.count({ where: { status: 'open' } });

    // Calculate total revenue from completed orders
    const completedOrders = await db.order.findMany({ where: { paymentStatus: 'paid' } });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTickets,
        activeTickets,
        totalOrders,
        totalRevenue,
        pendingKyc,
        pendingWithdrawals,
        disputesOpen,
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
