import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Authorization token required' }, { status: 401 }) };
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return { payload };
}

// GET: List support tickets with filters
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (search) {
      where.OR = [
        { supId: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, username: true, email: true } },
          replies: { orderBy: { createdAt: 'desc' } },
        },
      }),
      db.supportTicket.count({ where }),
    ]);

    const ticketRecords = tickets.map(t => ({
      id: t.id,
      supId: t.supId,
      userId: t.userId,
      fullName: t.fullName,
      phone: t.phone,
      email: t.email,
      subject: t.subject,
      message: t.message,
      attachment: t.attachment,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user: t.user ? { id: t.user.id, name: t.user.name, username: t.user.username, email: t.user.email } : null,
      replyCount: t.replies.length,
      lastReplyAt: t.replies.length > 0 ? t.replies[0].createdAt.toISOString() : null,
    }));

    // Get counts by status
    const [openCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
      db.supportTicket.count({ where: { status: 'open' } }),
      db.supportTicket.count({ where: { status: 'in_progress' } }),
      db.supportTicket.count({ where: { status: 'resolved' } }),
      db.supportTicket.count({ where: { status: 'closed' } }),
    ]);

    return NextResponse.json({
      tickets: ticketRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts: { open: openCount, inProgress: inProgressCount, resolved: resolvedCount, closed: closedCount },
    });
  } catch (error) {
    console.error('Get admin support tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update support ticket (change status, priority, add reply)
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;
    const { id } = auth.payload as { id: string };

    const body = await req.json();
    const { ticketId, action } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    // Update status
    if (action === 'update_status') {
      const { status } = body;
      if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

      const updated = await db.supportTicket.update({
        where: { id: ticketId },
        data: { status },
      });

      await db.adminActivityLog.create({
        data: { adminId: id, action: 'support_ticket_status_update', details: `Ticket ${ticket.supId} status changed to ${status}` },
      });

      return NextResponse.json({ success: true, ticket: { id: updated.id, status: updated.status } });
    }

    // Update priority
    if (action === 'update_priority') {
      const { priority } = body;
      if (!priority) return NextResponse.json({ error: 'priority is required' }, { status: 400 });

      const updated = await db.supportTicket.update({
        where: { id: ticketId },
        data: { priority },
      });

      await db.adminActivityLog.create({
        data: { adminId: id, action: 'support_ticket_priority_update', details: `Ticket ${ticket.supId} priority changed to ${priority}` },
      });

      return NextResponse.json({ success: true, ticket: { id: updated.id, priority: updated.priority } });
    }

    // Add admin reply
    if (action === 'add_reply') {
      const { message } = body;
      if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });

      const reply = await db.supportReply.create({
        data: { ticketId, adminId: id, message },
      });

      // Auto-update status to in_progress when admin replies
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      });

      await db.adminActivityLog.create({
        data: { adminId: id, action: 'support_ticket_reply', details: `Reply to ticket ${ticket.supId}` },
      });

      return NextResponse.json({ success: true, reply: { id: reply.id, message: reply.message, createdAt: reply.createdAt.toISOString() } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update admin support ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
