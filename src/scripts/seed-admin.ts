#!/usr/bin/env bun
/**
 * Super Admin Seed Script for ETR (Eid Ticket Resell)
 * Creates a super admin and basic settings entries.
 * Run with: bun run src/scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// SHA-256 hash function - same implementation as auth.ts hashPassword
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  console.log('🚀 ETR Super Admin Seed Script');
  console.log('=' .repeat(50));

  // 1. Check if super admin already exists
  console.log('\n🔍 Checking for existing super admin...');
  const existingSuperAdmin = await db.admin.findFirst({
    where: { role: 'super_admin' },
  });

  if (existingSuperAdmin) {
    console.log(`⚠️  Super admin already exists!`);
    console.log(`   Email: ${existingSuperAdmin.email}`);
    console.log(`   Name: ${existingSuperAdmin.name}`);
    console.log(`   Role: ${existingSuperAdmin.role}`);
    console.log(`   ID: ${existingSuperAdmin.id}`);
    console.log('\n✅ Skipping super admin creation.');
  } else {
    console.log('📝 No super admin found. Creating one...');

    // Hash the password using SHA-256 (same as auth.ts)
    const hashedPassword = await hashPassword('Admin@2024');

    const superAdmin = await db.admin.create({
      data: {
        email: 'superadmin@etr.com.bd',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      },
    });

    console.log('✅ Super admin created successfully!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Active: ${superAdmin.isActive}`);
    console.log('\n   🔑 Login Credentials:');
    console.log(`   Email:    superadmin@etr.com.bd`);
    console.log(`   Password: Admin@2024`);
    console.log('\n   ⚠️  IMPORTANT: Change the default password after first login!');
  }

  // 2. Seed basic settings
  console.log('\n📝 Seeding basic settings...');
  const settingsData = [
    { key: 'site_name', value: 'Eid Ticket Resell', group: 'general' },
    { key: 'site_description', value: 'Bangladesh\'s trusted platform for reselling tickets.', group: 'general' },
    { key: 'admin_email', value: 'superadmin@etr.com.bd', group: 'general' },
    { key: 'support_email', value: 'support@etr.com.bd', group: 'general' },
    { key: 'platform_fee_online', value: '2', group: 'fees' },
    { key: 'platform_fee_counter', value: '3', group: 'fees' },
    { key: 'bkash_merchant_number', value: '+8801700000000', group: 'payment' },
    { key: 'withdrawal_min_amount', value: '500', group: 'payment' },
    { key: 'escrow_hold_hours', value: '48', group: 'system' },
    { key: 'maintenance_mode', value: 'false', group: 'system' },
    { key: 'max_tickets_per_seller', value: '10', group: 'system' },
    { key: 'auto_approve_verified_seller', value: 'true', group: 'system' },
    { key: 'otp_expiry_minutes', value: '5', group: 'system' },
    { key: 'site_logo', value: '', group: 'general' },
    { key: 'site_favicon', value: '', group: 'general' },
    { key: 'contact_phone', value: '+8801700000000', group: 'general' },
    { key: 'contact_address', value: 'Dhaka, Bangladesh', group: 'general' },
    { key: 'social_facebook', value: '', group: 'social' },
    { key: 'social_twitter', value: '', group: 'social' },
    { key: 'social_instagram', value: '', group: 'social' },
    { key: 'social_youtube', value: '', group: 'social' },
  ];

  let settingsCreated = 0;
  let settingsSkipped = 0;

  for (const setting of settingsData) {
    const existing = await db.setting.findUnique({ where: { key: setting.key } });
    if (existing) {
      console.log(`   ⏭️  Setting "${setting.key}" already exists, skipping.`);
      settingsSkipped++;
    } else {
      await db.setting.create({ data: setting });
      console.log(`   ✅ Setting "${setting.key}" created.`);
      settingsCreated++;
    }
  }

  console.log(`\n📊 Settings Summary: ${settingsCreated} created, ${settingsSkipped} skipped.`);

  // 3. Print final summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Final Database Counts:');
  console.log('─' .repeat(30));

  const counts = {
    admins: await db.admin.count(),
    superAdmins: await db.admin.count({ where: { role: 'super_admin' } }),
    settings: await db.setting.count(),
  };

  console.log(`   Total Admins:       ${counts.admins}`);
  console.log(`   Super Admins:       ${counts.superAdmins}`);
  console.log(`   Settings:           ${counts.settings}`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('=' .repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
