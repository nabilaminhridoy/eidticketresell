import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, generateOrderId } from '@/lib/auth';
import { PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_MINIMUM } from '@/lib/constants';

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

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'all'; // buyer, seller, all
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};

    if (role === 'buyer') {
      where.buyerId = payload.id;
    } else if (role === 'seller') {
      where.sellerId = payload.id;
    } else {
      where.OR = [
        { buyerId: payload.id },
        { sellerId: payload.id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          ticket: {
            select: {
              id: true,
              ticketId: true,
              transportType: true,
              transportCompany: true,
              routeFrom: true,
              routeTo: true,
              departureDate: true,
              departureTime: true,
              seatNumber: true,
              coachNumber: true,
              ticketType: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isKycVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { ticketId, deliveryMethod } = body;

    if (!ticketId || !deliveryMethod) {
      return NextResponse.json(
        { error: 'ticketId and deliveryMethod are required' },
        { status: 400 }
      );
    }

    if (!['online_pdf', 'in_person', 'courier'].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: 'Invalid delivery method. Must be: online_pdf, in_person, or courier' },
        { status: 400 }
      );
    }

    // Fetch ticket
    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.status !== 'active') {
      return NextResponse.json(
        { error: 'Ticket is not available for purchase' },
        { status: 400 }
      );
    }

    // Cannot buy own ticket
    if (ticket.sellerId === payload.id) {
      return NextResponse.json(
        { error: 'You cannot buy your own ticket' },
        { status: 400 }
      );
    }

    // Check if there's already a pending order for this ticket
    const existingOrder = await db.order.findFirst({
      where: {
        ticketId,
        buyerId: payload.id as string,
        status: { in: ['pending', 'confirmed', 'in_progress'] },
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: 'You already have an active order for this ticket' },
        { status: 409 }
      );
    }

    const platformFee = Math.max(
      PLATFORM_FEE_MINIMUM,
      Math.round(ticket.price * (PLATFORM_FEE_PERCENTAGE / 100))
    );
    const totalAmount = ticket.price + platformFee;

    // Generate order ID
    const counterName = 'order_counter';
    let counter = await db.counter.findUnique({ where: { name: counterName } });
    if (!counter) {
      counter = await db.counter.create({
        data: { name: counterName, value: 1 },
      });
    } else {
      counter = await db.counter.update({
        where: { name: counterName },
        data: { value: { increment: 1 } },
      });
    }

    const orderId = generateOrderId(counter.value);

    // Create order and update ticket status in transaction
    const order = await db.$transaction(async (tx) => {
      // Mark ticket as sold
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: 'sold' },
      });

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderId,
          ticketId,
          buyerId: payload.id as string,
          sellerId: ticket.sellerId,
          amount: ticket.price,
          platformFee,
          totalAmount,
          escrowStatus: 'held',
          paymentStatus: 'paid',
          deliveryMethod,
          deliveryStatus: 'pending',
          status: 'pending',
        },
        include: {
          ticket: {
            select: {
              id: true,
              ticketId: true,
              transportType: true,
              transportCompany: true,
              routeFrom: true,
              routeTo: true,
              departureDate: true,
              departureTime: true,
              seatNumber: true,
              coachNumber: true,
            },
          },
          buyer: {
            select: { id: true, name: true, avatar: true },
          },
          seller: {
            select: { id: true, name: true, avatar: true, isKycVerified: true },
          },
        },
      });

      // Hold escrow in seller's wallet
      const sellerWallet = await tx.wallet.findUnique({
        where: { userId: ticket.sellerId },
      });

      if (sellerWallet) {
        await tx.wallet.update({
          where: { userId: ticket.sellerId },
          data: {
            escrowBalance: { increment: ticket.price },
          },
        });

        // Create escrow transaction record
        await tx.transaction.create({
          data: {
            walletId: sellerWallet.id,
            type: 'escrow_hold',
            amount: ticket.price,
            balance: sellerWallet.escrowBalance + ticket.price,
            description: `Escrow hold for order ${orderId}`,
            orderId: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    // Create notifications for both buyer and seller
    await db.notification.createMany({
      data: [
        {
          userId: payload.id as string,
          title: 'Order Created',
          message: `Your order ${orderId} for ${ticket.routeFrom} → ${ticket.routeTo} has been placed. Payment is held in escrow.`,
          type: 'success',
        },
        {
          userId: ticket.sellerId,
          title: 'Ticket Sold!',
          message: `Your ticket ${ticket.ticketId} has been purchased! Order ${orderId}. Payment is held in escrow until delivery is confirmed.`,
          type: 'success',
        },
      ],
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
