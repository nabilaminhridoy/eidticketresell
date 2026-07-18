import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const payload = token ? verifyToken(token) : null;

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true, name: true, username: true, avatar: true,
            isKycVerified: true, role: true, createdAt: true,
          },
        },
        orders: {
          select: { id: true, orderId: true, buyerId: true, status: true, paymentStatus: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // Increment view count
    await db.ticket.update({ where: { id }, data: { views: { increment: 1 } } });

    // Determine if current user has purchased this ticket
    let hasPurchased = false;
    if (payload?.id) {
      const order = await db.order.findFirst({
        where: { ticketId: id, buyerId: payload.id as string, paymentStatus: 'paid' },
      });
      hasPurchased = !!order;
    }

    // Is the current user the seller?
    const isSeller = payload?.id === ticket.sellerId;
    const isAdmin = payload?.role === 'admin' || payload?.role === 'super_admin';

    // Hide sensitive info if not purchased, not seller, not admin
    const shouldHide = !hasPurchased && !isSeller && !isAdmin;

    const safeTicket = {
      ...ticket,
      pnrNumber: shouldHide ? null : ticket.pnrNumber,
      ticketDocument: shouldHide ? null : ticket.ticketDocument,
      seller: shouldHide ? {
        ...ticket.seller,
        name: null,
        username: null,
      } : ticket.seller,
    };

    return NextResponse.json({ ticket: safeTicket, hasPurchased, isSeller: isSeller || isAdmin });
  } catch (error) {
    console.error('Get ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const existingTicket = await db.ticket.findUnique({ where: { id } });
    if (!existingTicket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (existingTicket.sellerId !== payload.id && payload.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (existingTicket.status === 'sold') return NextResponse.json({ error: 'Cannot update a sold ticket' }, { status: 400 });

    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'transportCompany', 'routeFrom', 'routeTo', 'departureDate', 'departureTime',
      'boardingPoint', 'droppingPoint', 'seatClass', 'deckType', 'seatNumber', 'seatType',
      'coachNumber', 'ticketType', 'pnrNumber', 'originalPrice', 'price', 'description',
      'sellerNotes', 'ticketDocument', 'deliveryType', 'meetingPlace', 'courierName',
      'deliverySpeed', 'deliveryChargePaidBy', 'deliveryCharge', 'status',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (body.price && body.price !== existingTicket.price) {
      if (body.price <= 0) return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
      const fee = Math.max(20, Math.round(body.price * 0.02));
      updateData.platformFee = fee;
      updateData.totalAmount = body.price + fee;
    }

    if (body.status && !['active', 'cancelled', 'expired'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const ticket = await db.ticket.update({
      where: { id },
      data: updateData,
      include: { seller: { select: { id: true, name: true, avatar: true, isKycVerified: true, role: true } } },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const existingTicket = await db.ticket.findUnique({ where: { id } });
    if (!existingTicket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (existingTicket.sellerId !== payload.id && payload.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const ticket = await db.ticket.update({ where: { id }, data: { status: 'cancelled' } });
    return NextResponse.json({ message: 'Ticket deleted successfully', ticket });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
