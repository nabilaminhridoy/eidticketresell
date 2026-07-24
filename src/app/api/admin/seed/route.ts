import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

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

    // 1. Create super admin if not exists
    let superAdminCreated = false;
    const existingSuperAdmin = await db.admin.findFirst({ where: { role: 'super_admin' } });

    if (!existingSuperAdmin) {
      const hashedPassword = await hashPassword('Admin@2026');
      await db.admin.create({
        data: {
          email: 'admin@eidticketresell.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
        },
      });
      superAdminCreated = true;
      console.log('Super admin created via seed API');
    }

    // 2. Create basic settings if not exists
    const settingsData = [
      { key: 'site_name', value: 'Eid Ticket Resell', group: 'general' },
      { key: 'site_description', value: 'Bangladesh\'s trusted platform for reselling tickets.', group: 'general' },
      { key: 'admin_email', value: 'admin@eidticketresell.com', group: 'general' },
      { key: 'support_email', value: 'support@eidticketresell.com', group: 'general' },
      { key: 'platform_fee_online', value: '2', group: 'fees' },
      { key: 'platform_fee_counter', value: '3', group: 'fees' },
      { key: 'bkash_merchant_number', value: '+8801700000000', group: 'payment' },
      { key: 'withdrawal_min_amount', value: '500', group: 'payment' },
      { key: 'escrow_hold_hours', value: '48', group: 'system' },
      { key: 'maintenance_mode', value: 'false', group: 'system' },
    ];

    let settingsCreated = 0;
    for (const setting of settingsData) {
      const existing = await db.setting.findUnique({ where: { key: setting.key } });
      if (!existing) {
        await db.setting.create({ data: setting });
        settingsCreated++;
      }
    }

    // 3. Return counts of all entities
    const counts = {
      admins: await db.admin.count(),
      superAdmins: await db.admin.count({ where: { role: 'super_admin' } }),
      users: await db.user.count(),
      kyc: await db.kyc.count(),
      tickets: await db.ticket.count(),
      orders: await db.order.count(),
      transactions: await db.transaction.count(),
      withdrawals: await db.withdrawal.count(),
      disputes: await db.dispute.count(),
      refunds: await db.refund.count(),
      supportTickets: await db.supportTicket.count(),
      settings: await db.setting.count(),
      transportCompanies: await db.transportCompany.count(),
    };

    return NextResponse.json({
      message: superAdminCreated
        ? 'Super admin created successfully. For full seed data, run: bun run src/scripts/seed.ts'
        : 'Super admin already exists. For full seed data, run: bun run src/scripts/seed.ts',
      seeded: true,
      superAdminCreated,
      settingsCreated,
      counts,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
