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

    // Compute analytics from real database data
    const totalUsers = await db.user.count({ where: { isDeleted: false } });
    const totalTickets = await db.ticket.count();
    const activeTickets = await db.ticket.count({ where: { status: 'active' } });
    const totalOrders = await db.order.count();
    const completedOrders = await db.order.count({ where: { status: 'completed' } });

    const paidOrders = await db.order.findMany({ where: { paymentStatus: 'paid' } });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const platformFeeRevenue = paidOrders.reduce((sum, o) => sum + o.platformFee, 0);

    const pendingKyc = await db.kyc.count({ where: { status: 'pending' } });
    const pendingOrders = await db.order.count({ where: { status: 'pending' } });
    const disputedOrders = await db.order.count({ where: { status: 'disputed' } });

    // Transport type breakdown
    const busTickets = await db.ticket.count({ where: { transportType: 'bus' } });
    const trainTickets = await db.ticket.count({ where: { transportType: 'train' } });
    const flightTickets = await db.ticket.count({ where: { transportType: 'flight' } });
    const launchTickets = await db.ticket.count({ where: { transportType: 'launch' } });

    // User role breakdown
    const regularUsers = await db.user.count({ where: { role: 'user', isDeleted: false } });
    const verifiedSellers = await db.user.count({ where: { role: 'verified_seller', isDeleted: false } });
    const adminUsers = await db.user.count({ where: { role: { in: ['admin', 'super_admin'] } } });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false },
    });

    const recentOrders = await db.order.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalTickets,
        activeTickets,
        totalOrders,
        completedOrders,
        totalRevenue,
        platformFeeRevenue,
        pendingKyc,
        pendingOrders,
        disputedOrders,
        recentUsers,
        recentOrders,
      },
      breakdowns: {
        transportTypes: {
          bus: busTickets,
          train: trainTickets,
          flight: flightTickets,
          launch: launchTickets,
        },
        userRoles: {
          regular: regularUsers,
          verifiedSeller: verifiedSellers,
          admin: adminUsers,
        },
      },
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
