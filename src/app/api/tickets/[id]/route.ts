import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isKycVerified: true,
            role: true,
            createdAt: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderId: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.ticket.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingTicket = await db.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Only seller or admin can update
    if (existingTicket.sellerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'You are not authorized to update this ticket' },
        { status: 403 }
      );
    }

    // Cannot update sold tickets
    if (existingTicket.status === 'sold') {
      return NextResponse.json(
        { error: 'Cannot update a sold ticket' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'transportCompany', 'routeFrom', 'routeTo', 'departureDate',
      'departureTime', 'seatNumber', 'seatType', 'coachNumber',
      'ticketType', 'price', 'description', 'ticketDocument', 'status',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Recalculate fees if price changed
    if (body.price && body.price !== existingTicket.price) {
      if (body.price <= 0) {
        return NextResponse.json(
          { error: 'Price must be greater than 0' },
          { status: 400 }
        );
      }
      const calculatedFee = Math.max(20, Math.round(body.price * 0.02));
      updateData.platformFee = calculatedFee;
      updateData.totalAmount = body.price + calculatedFee;
    }

    // Validate status transitions
    if (body.status) {
      const validStatuses = ['active', 'cancelled', 'expired'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Can only set: active, cancelled, expired' },
          { status: 400 }
        );
      }
    }

    const ticket = await db.ticket.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isKycVerified: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingTicket = await db.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Only seller or admin can delete
    if (existingTicket.sellerId !== payload.id && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'You are not authorized to delete this ticket' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to cancelled
    const ticket = await db.ticket.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      message: 'Ticket deleted successfully',
      ticket,
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
