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
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const ticketType = searchParams.get('ticketType');
    const departureTimePeriod = searchParams.get('departureTimePeriod');
    const seatClassParam = searchParams.get('seatClass');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Helper to parse comma-separated values
    const parseCsv = (val: string | null) => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];

    const transportTypes = parseCsv(transportType);
    const ticketTypes = parseCsv(ticketType);
    const seatClasses = parseCsv(seatClassParam);
    const timePeriods = parseCsv(departureTimePeriod);

    // Build base where clause (always applied)
    const baseWhere: Record<string, unknown> = { status };
    if (transportTypes.length === 1) baseWhere.transportType = transportTypes[0];
    else if (transportTypes.length > 1) baseWhere.transportType = { in: transportTypes };
    if (from) baseWhere.routeFrom = { contains: from, mode: 'insensitive' };
    if (to) baseWhere.routeTo = { contains: to, mode: 'insensitive' };
    if (date) baseWhere.departureDate = date;
    if (ticketTypes.length === 1) baseWhere.ticketType = ticketTypes[0];
    else if (ticketTypes.length > 1) baseWhere.ticketType = { in: ticketTypes };
    if (seatClasses.length === 1) baseWhere.seatClass = seatClasses[0];
    else if (seatClasses.length > 1) baseWhere.seatClass = { in: seatClasses };
    if (minPrice || maxPrice) {
      const pf: Record<string, number> = {};
      if (minPrice) pf.gte = parseFloat(minPrice);
      if (maxPrice) pf.lte = parseFloat(maxPrice);
      baseWhere.price = pf;
    }

    // Build time period ranges
    // morning: 06:00-11:59, afternoon: 12:00-17:59, night: 18:00-23:59, mid_night: 00:00-05:59
    const timeRangeMap: Record<string, { gte: string; lte: string }> = {
      morning: { gte: '06:00', lte: '11:59' },
      afternoon: { gte: '12:00', lte: '17:59' },
      night: { gte: '18:00', lte: '23:59' },
      mid_night: { gte: '00:00', lte: '05:59' },
    };

    // Build final Prisma-compatible where clause
    let finalWhere: Record<string, unknown>;

    if (timePeriods.length > 0) {
      // When time period filtering is active, we need OR conditions
      // Each time period creates a separate branch with the time range added
      const orConditions: Array<Record<string, unknown>> = timePeriods
        .filter(p => timeRangeMap[p])
        .map(p => ({
          ...baseWhere,
          departureTime: timeRangeMap[p],
        }));

      if (orConditions.length === 0) {
        finalWhere = baseWhere;
      } else if (search) {
        // Need AND of (time period OR) and (search OR)
        finalWhere = {
          AND: [
            { OR: orConditions },
            {
              OR: [
                { ...baseWhere, routeFrom: { contains: search, mode: 'insensitive' } },
                { ...baseWhere, routeTo: { contains: search, mode: 'insensitive' } },
                { ...baseWhere, transportCompany: { contains: search, mode: 'insensitive' } },
                { ...baseWhere, ticketId: { contains: search, mode: 'insensitive' } },
                { ...baseWhere, description: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        };
      } else {
        finalWhere = { OR: orConditions };
      }
    } else {
      finalWhere = baseWhere;
      if (search) {
        finalWhere = {
          ...baseWhere,
          OR: [
            { routeFrom: { contains: search, mode: 'insensitive' } },
            { routeTo: { contains: search, mode: 'insensitive' } },
            { transportCompany: { contains: search, mode: 'insensitive' } },
            { ticketId: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        };
      }
    }

    const skip = (page - 1) * limit;
    const orderBy: Record<string, string> = {};
    const validSortFields = ['price', 'departureDate', 'departureTime', 'createdAt', 'views'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where: finalWhere,
        include: {
          seller: {
            select: {
              id: true, name: true, username: true, avatar: true, isKycVerified: true, role: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.ticket.count({ where: finalWhere }),
    ]);

    // For public listing: hide sensitive info unless buyer has purchased
    const safeTickets = tickets.map(ticket => ({
      ...ticket,
      pnrNumber: undefined,
      ticketDocument: undefined,
      seller: {
        ...ticket.seller,
        phone: undefined,
      },
    }));

    return NextResponse.json({ tickets: safeTickets, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    // Check KYC verification
    const user = await db.user.findUnique({ where: { id: payload.id as string } });
    if (!user?.isKycVerified) {
      return NextResponse.json({ error: 'KYC verification required to sell tickets. Please complete KYC first.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      transportType, transportCompany, ticketType, pnrNumber, ticketDocument,
      routeFrom, routeTo, departureDate, departureTime,
      boardingPoint, droppingPoint, seatClass, deckType, seatNumber, seatType, coachNumber,
      originalPrice, price, description, sellerNotes,
      deliveryType, meetingPlace, courierName, deliverySpeed,
      deliveryChargePaidBy, deliveryCharge,
      isConfirmed,
    } = body;

    // Validation
    if (!transportType || !['bus', 'train', 'flight', 'launch'].includes(transportType))
      return NextResponse.json({ error: 'Valid transport type required' }, { status: 400 });
    if (!transportCompany) return NextResponse.json({ error: 'Transport company required' }, { status: 400 });
    if (!ticketType || !['online_copy', 'counter_copy'].includes(ticketType))
      return NextResponse.json({ error: 'Valid ticket type required' }, { status: 400 });
    if (!routeFrom || !routeTo) return NextResponse.json({ error: 'Route from/to required' }, { status: 400 });
    if (!departureDate || !departureTime) return NextResponse.json({ error: 'Departure date and time required' }, { status: 400 });
    if (!price || price <= 0) return NextResponse.json({ error: 'Selling price must be greater than 0' }, { status: 400 });
    if (!ticketDocument) return NextResponse.json({ error: 'Ticket document/image required' }, { status: 400 });

    // Counter copy must have delivery type
    if (ticketType === 'counter_copy' && !deliveryType) {
      return NextResponse.json({ error: 'Delivery type required for counter copy tickets' }, { status: 400 });
    }
    if (deliveryType === 'in_person' && !meetingPlace) {
      return NextResponse.json({ error: 'Meeting place required for in-person delivery' }, { status: 400 });
    }
    if (deliveryType === 'courier' && !courierName) {
      return NextResponse.json({ error: 'Courier name required for courier delivery' }, { status: 400 });
    }

    // Seller must confirm
    if (!isConfirmed) {
      return NextResponse.json({ error: 'Please confirm the ticket information checkboxes' }, { status: 400 });
    }

    // Calculate platform fee
    const calculatedFee = Math.max(PLATFORM_FEE_MINIMUM, Math.round(price * (PLATFORM_FEE_PERCENTAGE / 100)));
    const totalAmount = price + calculatedFee;

    // Generate ticket ID
    const counterName = 'ticket_counter';
    let counter = await db.counter.findUnique({ where: { name: counterName } });
    if (!counter) counter = await db.counter.create({ data: { name: counterName, value: 1 } });
    else counter = await db.counter.update({ where: { name: counterName }, data: { value: { increment: 1 } } });
    const ticketId = generateTicketId(counter.value);

    const ticket = await db.ticket.create({
      data: {
        ticketId,
        sellerId: payload.id as string,
        transportType, transportCompany, ticketType,
        pnrNumber: pnrNumber || null,
        ticketDocument,
        routeFrom, routeTo, departureDate, departureTime,
        boardingPoint: boardingPoint || null,
        droppingPoint: droppingPoint || null,
        seatClass: seatClass || null,
        deckType: deckType || null,
        seatNumber: seatNumber || null,
        seatType: seatType || null,
        coachNumber: coachNumber || null,
        originalPrice: originalPrice || 0,
        price,
        platformFee: calculatedFee,
        totalAmount,
        description: description || null,
        sellerNotes: sellerNotes || null,
        deliveryType: deliveryType || null,
        meetingPlace: meetingPlace || null,
        courierName: courierName || null,
        deliverySpeed: deliverySpeed || null,
        deliveryChargePaidBy: deliveryChargePaidBy || null,
        deliveryCharge: deliveryCharge || 0,
        isConfirmed: true,
        status: 'active',
      },
      include: { seller: { select: { id: true, name: true, avatar: true, isKycVerified: true, role: true } } },
    });

    await db.notification.create({
      data: {
        userId: payload.id as string,
        title: 'Ticket Listed Successfully',
        message: `Your ticket ${ticketId} for ${routeFrom} → ${routeTo} has been listed at ৳${price}.`,
        type: 'success',
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
