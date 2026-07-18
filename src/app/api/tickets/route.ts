import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, generateTicketId } from '@/lib/auth';
import { PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_MINIMUM } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transportType = searchParams.get('transportType');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const ticketType = searchParams.get('ticketType');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Record<string, unknown> = {
      status: status || 'active',
    };

    if (transportType) {
      where.transportType = transportType;
    }

    if (from) {
      where.routeFrom = { contains: from, mode: 'insensitive' };
    }

    if (to) {
      where.routeTo = { contains: to, mode: 'insensitive' };
    }

    if (date) {
      where.departureDate = date;
    }

    if (ticketType) {
      where.ticketType = ticketType;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.price = priceFilter;
    }

    if (search) {
      where.OR = [
        { routeFrom: { contains: search, mode: 'insensitive' } },
        { routeTo: { contains: search, mode: 'insensitive' } },
        { transportCompany: { contains: search, mode: 'insensitive' } },
        { ticketId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    if (sortBy === 'price' || sortBy === 'departureDate' || sortBy === 'createdAt' || sortBy === 'views') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      db.ticket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
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
    const {
      transportType,
      transportCompany,
      routeFrom,
      routeTo,
      departureDate,
      departureTime,
      seatNumber,
      seatType,
      coachNumber,
      ticketType,
      price,
      description,
      ticketDocument,
    } = body;

    // Validate required fields
    if (!transportType || !transportCompany || !routeFrom || !routeTo || !departureDate || !departureTime || !ticketType || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: transportType, transportCompany, routeFrom, routeTo, departureDate, departureTime, ticketType, price' },
        { status: 400 }
      );
    }

    if (!['bus', 'train', 'flight', 'launch'].includes(transportType)) {
      return NextResponse.json(
        { error: 'Invalid transport type. Must be: bus, train, flight, or launch' },
        { status: 400 }
      );
    }

    if (!['online_copy', 'counter_copy'].includes(ticketType)) {
      return NextResponse.json(
        { error: 'Invalid ticket type. Must be: online_copy or counter_copy' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate platform fee
    const calculatedFee = Math.max(
      PLATFORM_FEE_MINIMUM,
      Math.round(price * (PLATFORM_FEE_PERCENTAGE / 100))
    );
    const totalAmount = price + calculatedFee;

    // Generate ticket ID using counter
    const counterName = 'ticket_counter';
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

    const ticketId = generateTicketId(counter.value);

    const ticket = await db.ticket.create({
      data: {
        ticketId,
        sellerId: payload.id as string,
        transportType,
        transportCompany,
        routeFrom,
        routeTo,
        departureDate,
        departureTime,
        seatNumber: seatNumber || null,
        seatType: seatType || null,
        coachNumber: coachNumber || null,
        ticketType,
        price,
        platformFee: calculatedFee,
        totalAmount,
        description: description || null,
        ticketDocument: ticketDocument || null,
        status: 'active',
      },
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

    // Create notification for seller
    await db.notification.create({
      data: {
        userId: payload.id as string,
        title: 'Ticket Listed Successfully',
        message: `Your ticket ${ticketId} for ${routeFrom} → ${routeTo} has been listed for sale at ৳${price}.`,
        type: 'success',
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
