import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalTickets,
      totalOrders,
      activeTickets,
      soldTickets,
      pendingKyc,
      totalRevenue,
      escrowBalance,
      pendingWithdrawals,
      recentUsers,
      recentOrders,
      ticketsByType,
    ] = await Promise.all([
      db.user.count({ where: { isDeleted: false } }),
      db.ticket.count(),
      db.order.count(),
      db.ticket.count({ where: { status: 'active' } }),
      db.ticket.count({ where: { status: 'sold' } }),
      db.kyc.count({ where: { status: 'pending' } }),
      db.order.aggregate({
        _sum: { platformFee: true },
        where: { paymentStatus: 'paid' },
      }),
      db.wallet.aggregate({
        _sum: { escrowBalance: true },
      }),
      db.withdrawal.count({ where: { status: 'pending' } }),
      db.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isKycVerified: true,
          createdAt: true,
        },
      }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          ticket: {
            select: {
              ticketId: true,
              transportType: true,
              routeFrom: true,
              routeTo: true,
            },
          },
          buyer: { select: { name: true } },
          seller: { select: { name: true } },
        },
      }),
      db.ticket.groupBy({
        by: ['transportType'],
        _count: { id: true },
        where: { status: 'active' },
      }),
    ]);

    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: { id: true },
      where: { isDeleted: false },
    });

    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTickets,
        totalOrders,
        activeTickets,
        soldTickets,
        pendingKyc,
        pendingWithdrawals,
        totalRevenue: totalRevenue._sum.platformFee || 0,
        totalEscrow: escrowBalance._sum.escrowBalance || 0,
      },
      charts: {
        ticketsByType: ticketsByType.map((t) => ({
          type: t.transportType,
          count: t._count.id,
        })),
        usersByRole: usersByRole.map((u) => ({
          role: u.role,
          count: u._count.id,
        })),
        ordersByStatus: ordersByStatus.map((o) => ({
          status: o.status,
          count: o._count.id,
        })),
      },
      recent: {
        users: recentUsers,
        orders: recentOrders,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
