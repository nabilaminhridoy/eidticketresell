import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Allow GET requests from browser for easy seeding
export async function GET(req: NextRequest) {
  return POST(req);
}

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
      // SMS settings
      { key: 'sms_provider', value: 'alpha_sms', group: 'sms' },
      { key: 'sms_api_key', value: '', group: 'sms' },
      { key: 'sms_sender_id', value: 'ETRBD', group: 'sms' },
      { key: 'sms_api_url', value: '', group: 'sms' },
      { key: 'sms_enabled', value: 'false', group: 'sms' },
      { key: 'sms_otp_enabled', value: 'false', group: 'sms' },
      // Payment gateway settings
      { key: 'SSLCZ_STORE_ID', value: '', group: 'payments' },
      { key: 'SSLCZ_STORE_PASSWORD', value: '', group: 'payments' },
      { key: 'SSLCZ_IS_SANDBOX', value: 'true', group: 'payments' },
      { key: 'SSLCZ_BASE_URL', value: 'https://sandbox.sslcommerz.com', group: 'payments' },
      { key: 'bkash_enabled', value: 'false', group: 'payments' },
      // bKash settings
      { key: 'BKASH_ENABLED', value: 'false', group: 'bkash' },
      { key: 'BKASH_APP_KEY', value: '', group: 'bkash' },
      { key: 'BKASH_APP_SECRET', value: '', group: 'bkash' },
      { key: 'BKASH_USERNAME', value: '', group: 'bkash' },
      { key: 'BKASH_PASSWORD', value: '', group: 'bkash' },
      { key: 'BKASH_IS_SANDBOX', value: 'true', group: 'bkash' },
      { key: 'BKASH_BASE_URL', value: 'https://checkout.sandbox.bka.sh/v1.2.0-beta', group: 'bkash' },
    ];

    let settingsCreated = 0;
    for (const setting of settingsData) {
      const existing = await db.setting.findUnique({ where: { key: setting.key } });
      if (!existing) {
        await db.setting.create({ data: setting });
        settingsCreated++;
      }
    }

    // 3. Seed PageContent for safety-guidelines
    let pageContentCreated = 0;
    const existingSafetyPage = await db.pageContent.findUnique({ where: { slug: 'safety-guidelines' } });
    if (!existingSafetyPage) {
      await db.pageContent.create({
        data: {
          slug: 'safety-guidelines',
          title: 'Safety Guidelines',
          titleBn: 'নিরাপত্তা নির্দেশিকা',
          isActive: true,
          content: JSON.stringify({
            heroSubtitle: 'Follow these guidelines for safe ticket buying and selling.',
            warningTitle: 'Important Warning',
            warningDesc: 'If any user requests payment outside the platform, report them immediately.',
          }),
          contentBn: JSON.stringify({
            heroSubtitle: 'নিরাপদ টিকেট কেনাবেচার জন্য এই নির্দেশিকা অনুসরণ করুন।',
            warningTitle: 'গুরুত্বপূর্ণ সতর্কতা',
            warningDesc: 'কোনো ব্যবহারকারী যদি প্ল্যাটফর্মের বাইরে পেমেন্ট চায়, অবিলম্বে রিপোর্ট করুন।',
          }),
        },
      });
      pageContentCreated++;
    }

    // 4. Return counts of all entities
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
      pageContentCreated,
      counts,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
