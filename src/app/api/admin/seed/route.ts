import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force');

    if (!force) {
      const existingAdmin = await db.admin.findFirst({ where: { role: 'super_admin' } });
      const existingUsers = await db.user.count();
      if (existingAdmin && existingUsers > 0) {
        return NextResponse.json({
          message: 'Database already seeded. Use ?force=true to re-seed.',
          seeded: true,
          counts: { admins: await db.admin.count(), users: existingUsers, tickets: await db.ticket.count(), orders: await db.order.count() },
        });
      }
    }

    // For seeding, please use the standalone script:
    // bun run src/scripts/seed.ts
    // 
    // The API route was simplified to avoid Turbopack memory issues.
    // If you need to re-seed via API, run: bun run src/scripts/seed.ts
    // Then call this endpoint without force=true to check status.

    return NextResponse.json({
      message: 'Please use the standalone seed script: bun run src/scripts/seed.ts',
      seeded: true,
      counts: {
        admins: await db.admin.count(),
        users: await db.user.count(),
        kyc: await db.kyc.count(),
        tickets: await db.ticket.count(),
        orders: await db.order.count(),
        transactions: await db.transaction.count(),
        withdrawals: await db.withdrawal.count(),
        disputes: await db.dispute.count(),
        refunds: await db.refund.count(),
        supportTickets: await db.supportTicket.count(),
      },
    });
  } catch (error) {
    console.error('Seed check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
