import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, generateOrderId } from '@/lib/auth';
import { PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_MINIMUM } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};
    if (role === 'buyer') where.buyerId = payload.id;
    else if (role === 'seller') where.sellerId = payload.id;
    else where.OR = [{ buyerId: payload.id }, { sellerId: payload.id }];
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          ticket: { select: { id: true, ticketId: true, transportType: true, transportCompany: true, routeFrom: true, routeTo: true, departureDate: true, departureTime: true, seatNumber: true, coachNumber: true, ticketType: true, price: true, pnrNumber: true, ticketDocument: true, deliveryType: true, meetingPlace: true, courierName: true, deliverySpeed: true, deliveryChargePaidBy: true, deliveryCharge: true } },
          buyer: { select: { id: true, name: true, username: true, avatar: true } },
          seller: { select: { id: true, name: true, username: true, avatar: true, isKycVerified: true } },
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    // For buyers who haven't paid yet, hide sensitive ticket info
    const safeOrders = orders.map(order => {
      const isBuyer = order.buyerId === payload.id;
      const hasPaid = order.paymentStatus === 'paid';
      if (isBuyer && !hasPaid) {
        return {
          ...order,
          ticket: {
            ...order.ticket,
            pnrNumber: undefined,
            ticketDocument: undefined,
          },
        };
      }
      return order;
    });

    return NextResponse.json({ orders: safeOrders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const body = await req.json();
    const { ticketId } = body;
    if (!ticketId) return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });

    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status !== 'active') return NextResponse.json({ error: 'Ticket is not available for purchase' }, { status: 400 });
    if (ticket.sellerId === payload.id) return NextResponse.json({ error: 'You cannot buy your own ticket' }, { status: 400 });

    // Check for existing active order
    const existing = await db.order.findFirst({
      where: { ticketId, buyerId: payload.id as string, status: { in: ['pending', 'confirmed', 'in_progress'] } },
    });
    if (existing) return NextResponse.json({ error: 'You already have an active order for this ticket' }, { status: 409 });

    // Calculate fees based on ticket type
    const platformFee = Math.max(PLATFORM_FEE_MINIMUM, Math.round(ticket.price * (PLATFORM_FEE_PERCENTAGE / 100)));

    let amount: number; // What seller receives
    let totalAmount: number; // What buyer pays

    if (ticket.ticketType === 'online_copy') {
      // Online copy: buyer pays full price + platform fee
      // Seller receives price - platform fee after escrow release
      amount = ticket.price - platformFee;
      totalAmount = ticket.price; // Buyer pays full price (platform fee deducted from seller's share)
    } else {
      // Counter copy: buyer only pays platform fee upfront
      // Seller receives price directly from buyer in person/courier
      amount = ticket.price; // Seller gets this directly from buyer
      totalAmount = platformFee; // Buyer only pays platform fee to platform
    }

    // Determine delivery method
    const deliveryMethod = ticket.ticketType === 'online_copy' ? 'online_pdf' : (ticket.deliveryType || 'in_person');

    // Generate order ID
    const counterName = 'order_counter';
    let counter = await db.counter.findUnique({ where: { name: counterName } });
    if (!counter) counter = await db.counter.create({ data: { name: counterName, value: 1 } });
    else counter = await db.counter.update({ where: { name: counterName }, data: { value: { increment: 1 } } });
    const orderId = generateOrderId(counter.value);

    // Generate QR code for counter copy delivery
    const qrCodeData = ticket.ticketType === 'counter_copy' ? `ETR-VERIFY:${ticket.ticketId}:${orderId}` : null;

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      await tx.ticket.update({ where: { id: ticketId }, data: { status: 'sold' } });

      const newOrder = await tx.order.create({
        data: {
          orderId,
          ticketId,
          buyerId: payload.id as string,
          sellerId: ticket.sellerId,
          amount,
          platformFee,
          totalAmount,
          escrowStatus: ticket.ticketType === 'online_copy' ? 'held' : 'held',
          paymentStatus: 'paid',
          deliveryMethod,
          deliveryStatus: 'pending',
          qrCode: qrCodeData,
          isQrScanned: false,
          status: 'confirmed',
        },
        include: {
          ticket: true,
          buyer: { select: { id: true, name: true, username: true, avatar: true } },
          seller: { select: { id: true, name: true, username: true, avatar: true, isKycVerified: true, phone: true } },
        },
      });

      // For online copy: hold escrow in seller's wallet
      if (ticket.ticketType === 'online_copy') {
        const sellerWallet = await tx.wallet.findUnique({ where: { userId: ticket.sellerId } });
        if (sellerWallet) {
          await tx.wallet.update({
            where: { userId: ticket.sellerId },
            data: { escrowBalance: { increment: amount } },
          });
          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              type: 'escrow_hold',
              amount: amount,
              balance: sellerWallet.escrowBalance + amount,
              description: `Escrow hold for order ${orderId}`,
              orderId: newOrder.id,
            },
          });
        }
      }

      // Create chat for the order
      await tx.chat.create({
        data: {
          orderId: newOrder.id,
          participants: {
            create: [
              { userId: payload.id as string },
              { userId: ticket.sellerId },
            ],
          },
        },
      });

      return newOrder;
    });

    await db.notification.createMany({
      data: [
        {
          userId: payload.id as string,
          title: 'Order Created',
          message: `Your order ${orderId} for ${ticket.routeFrom} → ${ticket.routeTo} has been placed. ${ticket.ticketType === 'online_copy' ? 'Payment held in escrow.' : 'Platform fee paid. Pay seller directly on delivery.'}`,
          type: 'success',
        },
        {
          userId: ticket.sellerId,
          title: 'Ticket Sold!',
          message: `Your ticket ${ticket.ticketId} has been purchased! Order ${orderId}. ${ticket.ticketType === 'online_copy' ? 'Payment held in escrow until delivery.' : 'Deliver ticket to buyer.'}`,
          type: 'success',
        },
      ],
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
