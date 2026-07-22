import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const pnr = req.nextUrl.searchParams.get('pnr');

    if (!pnr || !pnr.trim()) {
      return NextResponse.json(
        { error: 'PNR/Ticket number is required' },
        { status: 400 }
      );
    }

    const searchTerm = pnr.trim();

    // Try to find by PNR number first (it's @unique, so findUnique works)
    let ticket = await db.ticket.findUnique({
      where: { pnrNumber: searchTerm },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            isKycVerified: true,
          },
        },
      },
    });

    // If not found by PNR, try by ticketId (ETR-XXXXXXXX format)
    if (!ticket) {
      ticket = await db.ticket.findUnique({
        where: { ticketId: searchTerm },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              isKycVerified: true,
            },
          },
        },
      });
    }

    if (!ticket) {
      return NextResponse.json(
        { found: false, message: 'No ticket found with this PNR/Ticket number. Please check and try again.' },
        { status: 404 }
      );
    }

    // Determine if verified (active or sold = legitimate)
    const isVerified = ticket.status === 'active' || ticket.status === 'sold';

    // Return only the fields needed for verification (no sensitive data)
    const verifiedTicket = {
      id: ticket.id,
      ticketId: ticket.ticketId,
      transportType: ticket.transportType,
      transportCompany: ticket.transportCompany,
      routeFrom: ticket.routeFrom,
      routeTo: ticket.routeTo,
      departureDate: ticket.departureDate,
      departureTime: ticket.departureTime,
      ticketType: ticket.ticketType,
      seatClass: ticket.seatClass,
      seatNumber: ticket.seatNumber,
      seatType: ticket.seatType,
      coachNumber: ticket.coachNumber,
      status: ticket.status,
      seller: {
        id: ticket.seller.id,
        name: ticket.seller.name,
        isKycVerified: ticket.seller.isKycVerified,
      },
    };

    return NextResponse.json({ found: true, isVerified, ticket: verifiedTicket });
  } catch (error) {
    console.error('Verify ticket error:', error);
    return NextResponse.json(
      { found: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
