import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pnr = searchParams.get('pnr');

    if (!pnr || pnr.trim() === '') {
      return NextResponse.json(
        { available: false, message: 'PNR number is required' },
        { status: 400 }
      );
    }

    const trimmedPnr = pnr.trim();

    // Check if a ticket with this PNR already exists
    // pnrNumber is @unique so we use findUnique (exact match, SQLite compatible)
    const existingTicket = await db.ticket.findUnique({
      where: { pnrNumber: trimmedPnr },
      select: { id: true },
    });

    if (existingTicket) {
      return NextResponse.json({
        available: false,
        message: 'PNR number already exists',
      });
    }

    return NextResponse.json({
      available: true,
    });
  } catch (error) {
    console.error('Check PNR error:', error);
    return NextResponse.json(
      { available: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
