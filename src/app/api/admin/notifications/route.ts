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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build admin-specific notifications from recent activity
    // Get recent support tickets (new submissions), new user registrations, new orders, etc.
    const notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      createdAt: string;
    }> = [];

    // 1. New support tickets
    const recentSupportTickets = await db.supportTicket.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    for (const ticket of recentSupportTickets) {
      notifications.push({
        id: `support-${ticket.id}`,
        title: `New Support Ticket: ${ticket.subject}`,
        message: `From ${ticket.fullName} (${ticket.email}) — ${ticket.message.substring(0, 100)}${ticket.message.length > 100 ? '...' : ''}`,
        type: 'info',
        isRead: false,
        createdAt: ticket.createdAt.toISOString(),
      });
    }

    // 2. New user registrations (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsers = await db.user.findMany({
      where: { createdAt: { gte: yesterday } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const user of newUsers) {
      notifications.push({
        id: `user-${user.id}`,
        title: `New User Registered`,
        message: `${user.name} (${user.email}) joined the platform`,
        type: 'success',
        isRead: false,
        createdAt: user.createdAt.toISOString(),
      });
    }

    // 3. Recent orders
    const recentOrders = await db.order.findMany({
      where: { createdAt: { gte: yesterday } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { ticket: { select: { transportCompany: true, routeFrom: true, routeTo: true } } },
    });

    for (const order of recentOrders) {
      notifications.push({
        id: `order-${order.id}`,
        title: `New Order: ${order.orderId}`,
        message: `${order.ticket.transportCompany} — ${order.ticket.routeFrom} → ${order.ticket.routeTo} | ৳${order.totalAmount}`,
        type: 'info',
        isRead: false,
        createdAt: order.createdAt.toISOString(),
      });
    }

    // 4. Pending KYC verifications
    const pendingKyc = await db.kyc.findMany({
      where: { status: 'pending' },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    for (const kyc of pendingKyc) {
      notifications.push({
        id: `kyc-${kyc.id}`,
        title: `KYC Verification Pending`,
        message: `${kyc.user.name} submitted KYC verification (Document: ${kyc.documentType})`,
        type: 'warning',
        isRead: false,
        createdAt: kyc.submittedAt?.toISOString() || kyc.createdAt.toISOString(),
      });
    }

    // 5. Pending withdrawals
    const pendingWithdrawals = await db.withdrawal.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { wallet: { include: { user: { select: { name: true } } } } },
    });

    for (const wdr of pendingWithdrawals) {
      notifications.push({
        id: `wdr-${wdr.id}`,
        title: `Withdrawal Request Pending`,
        message: `${wdr.wallet.user.name} requested ৳${wdr.amount} via ${wdr.method}`,
        type: 'warning',
        isRead: false,
        createdAt: wdr.createdAt.toISOString(),
      });
    }

    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter by type if specified
    const filtered = type ? notifications.filter(n => n.type === type) : notifications;
    const unreadOnlyFiltered = unreadOnly ? filtered.filter(n => !n.isRead) : filtered;

    const totalUnread = notifications.filter(n => !n.isRead).length;
    const paginated = unreadOnlyFiltered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      notifications: paginated,
      unreadCount: totalUnread,
      pagination: { page, limit, total: unreadOnlyFiltered.length, totalPages: Math.ceil(unreadOnlyFiltered.length / limit) },
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
