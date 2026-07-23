import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check if force re-seed is requested
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force');

    if (!force) {
      const existingAdmin = await db.admin.findFirst({ where: { role: 'super_admin' } });
      const existingUsers = await db.user.count();
      if (existingAdmin && existingUsers > 0) {
        return NextResponse.json({
          message: 'Database already seeded. Use ?force=true to re-seed.',
          admin: { email: existingAdmin.email, name: existingAdmin.name },
          counts: { users: existingUsers },
        });
      }
    }

    const summary: Record<string, number> = {};

    // ==========================================
    // 1. ADMINS (Super Admin + 2 Regular Admins)
    // ==========================================
    const hashedPassword = await hashPassword('admin123');

    const admins = await Promise.all([
      db.admin.upsert({
        where: { email: 'admin@eidticketresell.com' },
        update: { name: 'Super Admin', password: hashedPassword, role: 'super_admin', isActive: true },
        create: {
          email: 'admin@eidticketresell.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
        },
      }),
      db.admin.upsert({
        where: { email: 'moderator@eidticketresell.com' },
        update: {},
        create: {
          email: 'moderator@eidticketresell.com',
          name: 'Moderator Admin',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      }),
      db.admin.upsert({
        where: { email: 'support@eidticketresell.com' },
        update: {},
        create: {
          email: 'support@eidticketresell.com',
          name: 'Support Staff',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      }),
    ]);
    summary.admins = admins.length;

    // ==========================================
    // 2. COUNTERS (For ID Generation)
    // ==========================================
    const counters = await Promise.all([
      db.counter.upsert({ where: { name: 'ticket_counter' }, update: { value: 12 }, create: { name: 'ticket_counter', value: 12 } }),
      db.counter.upsert({ where: { name: 'order_counter' }, update: { value: 8 }, create: { name: 'order_counter', value: 8 } }),
      db.counter.upsert({ where: { name: 'kyc_counter' }, update: { value: 8 }, create: { name: 'kyc_counter', value: 8 } }),
      db.counter.upsert({ where: { name: 'payment_counter' }, update: { value: 15 }, create: { name: 'payment_counter', value: 15 } }),
      db.counter.upsert({ where: { name: 'withdrawal_counter' }, update: { value: 5 }, create: { name: 'withdrawal_counter', value: 5 } }),
      db.counter.upsert({ where: { name: 'payout_counter' }, update: { value: 0 }, create: { name: 'payout_counter', value: 0 } }),
      db.counter.upsert({ where: { name: 'wallet_transaction_counter' }, update: { value: 15 }, create: { name: 'wallet_transaction_counter', value: 15 } }),
      db.counter.upsert({ where: { name: 'refund_counter' }, update: { value: 0 }, create: { name: 'refund_counter', value: 0 } }),
      db.counter.upsert({ where: { name: 'dispute_counter' }, update: { value: 2 }, create: { name: 'dispute_counter', value: 2 } }),
      db.counter.upsert({ where: { name: 'support_counter' }, update: { value: 5 }, create: { name: 'support_counter', value: 5 } }),
    ]);
    summary.counters = counters.length;

    // ==========================================
    // 3. SETTINGS
    // ==========================================
    const settings = await Promise.all([
      db.setting.create({ data: { key: 'site_name', value: 'Eid Ticket Resell', group: 'general' } }),
      db.setting.create({ data: { key: 'site_description', value: 'Bangladesh\'s trusted platform for reselling and buying bus, train, flight, and launch tickets during Eid and peak travel seasons.', group: 'general' } }),
      db.setting.create({ data: { key: 'site_tagline', value: 'পূণ্যময় ঈদে নিরাপদ যাত্রা', group: 'general' } }),
      db.setting.create({ data: { key: 'contact_email', value: 'support@eidticketresell.com', group: 'general' } }),
      db.setting.create({ data: { key: 'contact_phone', value: '+8801700000000', group: 'general' } }),
      db.setting.create({ data: { key: 'platform_fee_online', value: '2', group: 'fees' } }),
      db.setting.create({ data: { key: 'platform_fee_counter', value: '3', group: 'fees' } }),
      db.setting.create({ data: { key: 'min_listing_price', value: '100', group: 'fees' } }),
      db.setting.create({ data: { key: 'max_listing_price', value: '10000', group: 'fees' } }),
      db.setting.create({ data: { key: 'bkash_merchant_number', value: '+8801700000000', group: 'payment' } }),
      db.setting.create({ data: { key: 'bank_name', value: 'Dutch-Bangla Bank', group: 'payment' } }),
      db.setting.create({ data: { key: 'bank_account_name', value: 'Eid Ticket Resell Ltd', group: 'payment' } }),
      db.setting.create({ data: { key: 'bank_account_number', value: '1234567890', group: 'payment' } }),
      db.setting.create({ data: { key: 'bank_routing_number', value: '090123456', group: 'payment' } }),
      db.setting.create({ data: { key: 'withdrawal_min_amount', value: '500', group: 'payment' } }),
      db.setting.create({ data: { key: 'withdrawal_processing_days', value: '3', group: 'payment' } }),
      db.setting.create({ data: { key: 'courier_charge_normal', value: '60', group: 'delivery' } }),
      db.setting.create({ data: { key: 'courier_charge_express', value: '120', group: 'delivery' } }),
      db.setting.create({ data: { key: 'enable_sms_notification', value: 'true', group: 'notification' } }),
      db.setting.create({ data: { key: 'enable_push_notification', value: 'true', group: 'notification' } }),
      db.setting.create({ data: { key: 'maintenance_mode', value: 'false', group: 'system' } }),
      db.setting.create({ data: { key: 'max_tickets_per_seller', value: '5', group: 'system' } }),
      db.setting.create({ data: { key: 'auto_approve_verified_seller', value: 'false', group: 'system' } }),
      db.setting.create({ data: { key: 'escrow_hold_hours', value: '48', group: 'system' } }),
    ]);
    summary.settings = settings.length;

    // ==========================================
    // 4. TRANSPORT COMPANIES (10)
    // ==========================================
    const transportCompanies = await Promise.all([
      db.transportCompany.create({ data: { name: 'Green Line Paribahan', nameBn: 'গ্রিন লাইন পরিবহন', type: 'bus', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Shyamoli Paribahan', nameBn: 'শ্যামলী পরিবহন', type: 'bus', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রিজ', type: 'bus', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Desh Travels', nameBn: 'দেশ ট্রাভেলস', type: 'bus', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Bangladesh Railway', nameBn: 'বাংলাদেশ রেলওয়ে', type: 'train', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Biman Bangladesh Airlines', nameBn: 'বিমান বাংলাদেশ এয়ারলাইন্স', type: 'flight', isActive: true } }),
      db.transportCompany.create({ data: { name: 'US-Bangla Airlines', nameBn: 'US-বাংলা এয়ারলাইন্স', type: 'flight', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Novoair', nameBn: 'নভোএয়ার', type: 'flight', isActive: true } }),
      db.transportCompany.create({ data: { name: 'BIWTC Launch Service', nameBn: 'বিআইডব্লিউটিসি লঞ্চ সার্ভিস', type: 'launch', isActive: true } }),
      db.transportCompany.create({ data: { name: 'Sadharan Bima Launch', nameBn: 'সাধারণ বিমা লঞ্চ', type: 'launch', isActive: true } }),
    ]);
    summary.transportCompanies = transportCompanies.length;

    // ==========================================
    // 5. BLOG CATEGORIES (3)
    // ==========================================
    const blogCategories = await Promise.all([
      db.blogCategory.create({ data: { name: 'Travel Tips', slug: 'travel-tips' } }),
      db.blogCategory.create({ data: { name: 'Festival Guide', slug: 'festival-guide' } }),
      db.blogCategory.create({ data: { name: 'Safety & Security', slug: 'safety-security' } }),
    ]);
    summary.blogCategories = blogCategories.length;

    // ==========================================
    // 6. FAQ CATEGORIES (5)
    // ==========================================
    const faqCategories = await Promise.all([
      db.faqCategory.create({ data: { name: 'Buying Tickets', slug: 'buying-tickets', order: 1 } }),
      db.faqCategory.create({ data: { name: 'Selling Tickets', slug: 'selling-tickets', order: 2 } }),
      db.faqCategory.create({ data: { name: 'Payments & Wallet', slug: 'payments-wallet', order: 3 } }),
      db.faqCategory.create({ data: { name: 'KYC Verification', slug: 'kyc-verification', order: 4 } }),
      db.faqCategory.create({ data: { name: 'Delivery & Shipping', slug: 'delivery-shipping', order: 5 } }),
    ]);
    summary.faqCategories = faqCategories.length;

    // ==========================================
    // 7. ADS (4)
    // ==========================================
    const ads = await Promise.all([
      db.ad.create({
        data: {
          title: 'Eid Special - Book Your Tickets Early!',
          description: 'Don\'t wait until the last minute. Book your Eid travel tickets now and save up to 20%.',
          image: '/ads/eid-special-banner.jpg',
          link: '/search',
          placement: 'homepage',
          type: 'banner',
          isActive: true,
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-06-30'),
          impressions: 15420,
          clicks: 890,
        },
      }),
      db.ad.create({
        data: {
          title: 'US-Bangla Airlines - Lowest Fares',
          description: 'Fly with US-Bangla Airlines at the lowest fares. Dhaka to Chittagong starting from ৳2,500.',
          image: '/ads/us-bangla-sidebar.jpg',
          link: '/search?type=flight',
          placement: 'sidebar',
          type: 'banner',
          isActive: true,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          impressions: 8300,
          clicks: 410,
        },
      }),
      db.ad.create({
        data: {
          title: 'Green Line Paribahan - AC Sleeper Seats',
          description: 'Experience luxury travel with Green Line\'s AC Sleeper service. Dhaka-Cox\'s Bazar route.',
          image: '/ads/green-line-header.jpg',
          link: '/search?company=green-line',
          placement: 'header',
          type: 'banner',
          isActive: true,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-08-31'),
          impressions: 6700,
          clicks: 230,
        },
      }),
      db.ad.create({
        data: {
          title: 'New User Discount - ৳50 Off First Purchase',
          description: 'Use code NEWUSER at checkout for ৳50 off your first ticket purchase.',
          placement: 'buy-tickets',
          type: 'text',
          isActive: true,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          impressions: 12000,
          clicks: 1560,
        },
      }),
    ]);
    summary.ads = ads.length;

    // ==========================================
    // 8. COUPONS (3)
    // ==========================================
    const coupons = await Promise.all([
      db.coupon.create({
        data: {
          code: 'EID2025',
          type: 'percentage',
          value: 10,
          minAmount: 500,
          maxDiscount: 500,
          usageLimit: 1000,
          usedCount: 45,
          validFrom: new Date('2025-03-01'),
          validUntil: new Date('2025-07-01'),
          isActive: true,
        },
      }),
      db.coupon.create({
        data: {
          code: 'NEWUSER',
          type: 'fixed',
          value: 50,
          minAmount: 200,
          maxDiscount: 50,
          usageLimit: 5000,
          usedCount: 2340,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
        },
      }),
      db.coupon.create({
        data: {
          code: 'REFER50',
          type: 'fixed',
          value: 50,
          minAmount: 300,
          maxDiscount: 50,
          usageLimit: 2000,
          usedCount: 890,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
        },
      }),
    ]);
    summary.coupons = coupons.length;

    // ==========================================
    // 9. USERS (15 - Mix of buyers and verified sellers)
    // ==========================================
    const userPassword = await hashPassword('user1234');

    const usersData = [
      // Verified Sellers (5)
      { username: 'karim_seller', name: 'Karim Uddin', email: 'karim@example.com', phone: '+8801711234501', role: 'verified_seller', isKycVerified: true, gender: 'male', dateOfBirth: '1985-03-15', referredBy: null },
      { username: 'rahim_tickets', name: 'Rahim Khan', email: 'rahim@example.com', phone: '+8801811234502', role: 'verified_seller', isKycVerified: true, gender: 'male', dateOfBirth: '1990-07-22', referredBy: null },
      { username: 'zahid_travels', name: 'Zahid Hassan', email: 'zahid@example.com', phone: '+8801911234503', role: 'verified_seller', isKycVerified: true, gender: 'male', dateOfBirth: '1988-01-10', referredBy: null },
      { username: 'tanvir_sell', name: 'Tanvir Ahmed', email: 'tanvir@example.com', phone: '+8801511234504', role: 'verified_seller', isKycVerified: true, gender: 'male', dateOfBirth: '1992-11-28', referredBy: null },
      { username: 'aminul_bd', name: 'Aminul Islam', email: 'aminul@example.com', phone: '+8801611234505', role: 'verified_seller', isKycVerified: true, gender: 'male', dateOfBirth: '1987-05-14', referredBy: null },
      // Buyers (7)
      { username: 'fatima_buyer', name: 'Fatima Begum', email: 'fatima@example.com', phone: '+8801411234506', role: 'user', isKycVerified: true, gender: 'female', dateOfBirth: '1995-09-03', referredBy: null },
      { username: 'nasreen_ak', name: 'Nasreen Akter', email: 'nasreen@example.com', phone: '+8801711234507', role: 'user', isKycVerified: false, gender: 'female', dateOfBirth: '1998-04-18', referredBy: 'karim_seller' },
      { username: 'sabina_yas', name: 'Sabina Yasmin', email: 'sabina@example.com', phone: '+8801811234508', role: 'user', isKycVerified: false, gender: 'female', dateOfBirth: '1996-12-01', referredBy: null },
      { username: 'rumi_akter', name: 'Rumi Akter', email: 'rumi@example.com', phone: '+8801911234509', role: 'user', isKycVerified: true, gender: 'female', dateOfBirth: '1993-06-25', referredBy: null },
      { username: 'imran_hossain', name: 'Imran Hossain', email: 'imran@example.com', phone: '+8801511234510', role: 'user', isKycVerified: false, gender: 'male', dateOfBirth: '1997-08-09', referredBy: 'rahim_tickets' },
      { username: 'mahbub_alam', name: 'Mahbub Alam', email: 'mahbub@example.com', phone: '+8801611234511', role: 'user', isKycVerified: false, gender: 'male', dateOfBirth: '1994-02-14', referredBy: null },
      { username: 'rifat_jahan', name: 'Rifat Jahan', email: 'rifat@example.com', phone: '+8801711234512', role: 'user', isKycVerified: false, gender: 'female', dateOfBirth: '2000-10-30', referredBy: null },
      // Mixed (3) - one verified seller pending KYC, two regular users
      { username: 'sharmin_sul', name: 'Sharmin Sultana', email: 'sharmin@example.com', phone: '+8801811234513', role: 'user', isKycVerified: false, gender: 'female', dateOfBirth: '1991-04-07', referredBy: null },
      { username: 'nusrat_khan', name: 'Nusrat Khan', email: 'nusrat@example.com', phone: '+8801911234514', role: 'user', isKycVerified: false, gender: 'female', dateOfBirth: '1999-07-20', referredBy: null },
      { username: 'mohammad_ali', name: 'Mohammad Ali', email: 'mohammadali@example.com', phone: '+8801511234515', role: 'user', isKycVerified: true, gender: 'male', dateOfBirth: '1986-09-11', referredBy: null },
    ];

    const users = [];
    for (const u of usersData) {
      const referredByUserId = u.referredBy ? null : null; // will link after users are created
      const created = await db.user.create({
        data: {
          username: u.username,
          name: u.name,
          email: u.email,
          phone: u.phone,
          password: userPassword,
          role: u.role,
          isKycVerified: u.isKycVerified,
          emailVerified: u.isKycVerified,
          phoneVerified: u.isKycVerified,
          gender: u.gender,
          dateOfBirth: u.dateOfBirth,
          isActive: true,
        },
      });
      users.push({ ...created, _referredByUsername: u.referredBy });
    }
    summary.users = users.length;

    // Link referrals
    for (const user of users) {
      if (user._referredByUsername) {
        const referrer = users.find(u => u.username === user._referredByUsername);
        if (referrer) {
          await db.user.update({ where: { id: user.id }, data: { referredBy: referrer.id } });
        }
      }
    }

    // ==========================================
    // 10. KYC RECORDS (8 - 5 approved, 2 pending, 1 rejected)
    // ==========================================
    const sellerIds = users.filter(u => u.role === 'verified_seller').map(u => u.id);
    const buyerIds = users.filter(u => u.role === 'user').map(u => u.id);

    const kycData = [
      // 5 Approved KYC (for verified sellers)
      {
        userId: sellerIds[0], kycName: 'Karim Uddin', kycDob: '1985-03-15', kycGender: 'male',
        documentType: 'nid', documentNumber: '1990517634',
        documentFront: '/kyc/karim_nid_front.jpg', documentBack: '/kyc/karim_nid_back.jpg',
        houseRoadVillage: '42/1 Mirpur Road', upazilaThana: 'Mirpur', district: 'Dhaka', division: 'Dhaka', postalCode: '1216',
        selfiePhoto: '/kyc/karim_selfie.jpg', selfieRight: '/kyc/karim_selfie_right.jpg', selfieLeft: '/kyc/karim_selfie_left.jpg',
        gpsLatitude: 23.8061, gpsLongitude: 90.3687,
        status: 'approved', reviewedBy: admins[0].id, reviewNote: 'All documents verified successfully.',
        submittedAt: new Date('2025-01-15'), reviewedAt: new Date('2025-01-16'),
      },
      {
        userId: sellerIds[1], kycName: 'Rahim Khan', kycDob: '1990-07-22', kycGender: 'male',
        documentType: 'nid', documentNumber: '1992354789',
        documentFront: '/kyc/rahim_nid_front.jpg', documentBack: '/kyc/rahim_nid_back.jpg',
        houseRoadVillage: '15/A DIT Road', upazilaThana: 'Badda', district: 'Dhaka', division: 'Dhaka', postalCode: '1212',
        selfiePhoto: '/kyc/rahim_selfie.jpg', selfieRight: '/kyc/rahim_selfie_right.jpg',
        gpsLatitude: 23.7935, gpsLongitude: 90.4153,
        status: 'approved', reviewedBy: admins[0].id, reviewNote: 'NID and selfie match confirmed.',
        submittedAt: new Date('2025-01-20'), reviewedAt: new Date('2025-01-21'),
      },
      {
        userId: sellerIds[2], kycName: 'Zahid Hassan', kycDob: '1988-01-10', kycGender: 'male',
        documentType: 'driving_licence', documentNumber: 'DL-0423-88-12345',
        documentFront: '/kyc/zahid_dl_front.jpg', documentBack: '/kyc/zahid_dl_back.jpg',
        houseRoadVillage: '7/3 Agrabad C/A', upazilaThana: 'Double Mooring', district: 'Chittagong', division: 'Chittagong', postalCode: '4100',
        selfiePhoto: '/kyc/zahid_selfie.jpg', selfieSmile: '/kyc/zahid_selfie_smile.jpg',
        gpsLatitude: 22.3354, gpsLongitude: 91.8126,
        status: 'approved', reviewedBy: admins[1].id, reviewNote: 'Driving licence verified.',
        submittedAt: new Date('2025-02-01'), reviewedAt: new Date('2025-02-02'),
      },
      {
        userId: sellerIds[3], kycName: 'Tanvir Ahmed', kycDob: '1992-11-28', kycGender: 'male',
        documentType: 'passport', documentNumber: 'BP1234567',
        documentFront: '/kyc/tanvir_passport_front.jpg', documentBack: '/kyc/tanvir_passport_back.jpg',
        houseRoadVillage: '28 Subhash Road', upazilaThana: 'Sylhet Sadar', district: 'Sylhet', division: 'Sylhet', postalCode: '3100',
        selfiePhoto: '/kyc/tanvir_selfie.jpg', selfieBlink: '/kyc/tanvir_selfie_blink.jpg',
        gpsLatitude: 24.8949, gpsLongitude: 91.8687,
        status: 'approved', reviewedBy: admins[0].id, reviewNote: 'Passport verified. Address matches.',
        submittedAt: new Date('2025-02-10'), reviewedAt: new Date('2025-02-11'),
      },
      {
        userId: sellerIds[4], kycName: 'Aminul Islam', kycDob: '1987-05-14', kycGender: 'male',
        documentType: 'nid', documentNumber: '1987145632',
        documentFront: '/kyc/aminul_nid_front.jpg', documentBack: '/kyc/aminul_nid_back.jpg',
        houseRoadVillage: '103 Rajshahi College Road', upazilaThana: 'Rajshahi Sadar', district: 'Rajshahi', division: 'Rajshahi', postalCode: '6000',
        selfiePhoto: '/kyc/aminul_selfie.jpg',
        gpsLatitude: 24.3745, gpsLongitude: 88.6042,
        status: 'approved', reviewedBy: admins[1].id, reviewNote: 'NID verified. Selfie matches.',
        submittedAt: new Date('2025-02-15'), reviewedAt: new Date('2025-02-16'),
      },
      // 2 Pending KYC (for non-verified users)
      {
        userId: buyerIds[0], kycName: 'Fatima Begum', kycDob: '1995-09-03', kycGender: 'female',
        documentType: 'nid', documentNumber: '1995034521',
        documentFront: '/kyc/fatima_nid_front.jpg', documentBack: '/kyc/fatima_nid_back.jpg',
        houseRoadVillage: '5/2 Uttara Sector 7', upazilaThana: 'Uttara', district: 'Dhaka', division: 'Dhaka', postalCode: '1230',
        selfiePhoto: '/kyc/fatima_selfie.jpg',
        gpsLatitude: 23.8758, gpsLongitude: 90.4014,
        status: 'pending', reviewedBy: null, reviewNote: null,
        submittedAt: new Date('2025-03-05'), reviewedAt: null,
      },
      {
        userId: buyerIds[3], kycName: 'Rumi Akter', kycDob: '1993-06-25', kycGender: 'female',
        documentType: 'nid', documentNumber: '1993067234',
        documentFront: '/kyc/rumi_nid_front.jpg', documentBack: '/kyc/rumi_nid_back.jpg',
        houseRoadVillage: '12/B Mohakhali', upazilaThana: 'Gulshan', district: 'Dhaka', division: 'Dhaka', postalCode: '1212',
        selfiePhoto: '/kyc/rumi_selfie.jpg',
        gpsLatitude: 23.7774, gpsLongitude: 90.4014,
        status: 'pending', reviewedBy: null, reviewNote: null,
        submittedAt: new Date('2025-03-10'), reviewedAt: null,
      },
      // 1 Rejected KYC
      {
        userId: buyerIds[5], kycName: 'Imran Hossain', kycDob: '1997-08-09', kycGender: 'male',
        documentType: 'nid', documentNumber: '1997089123',
        documentFront: '/kyc/imran_nid_front.jpg', documentBack: '/kyc/imran_nid_back.jpg',
        houseRoadVillage: '33 Banani', upazilaThana: 'Banani', district: 'Dhaka', division: 'Dhaka', postalCode: '1213',
        selfiePhoto: '/kyc/imran_selfie.jpg',
        gpsLatitude: 23.7935, gpsLongitude: 90.4066,
        status: 'rejected', reviewedBy: admins[1].id, reviewNote: 'Selfie does not match NID photo. Please resubmit with clear selfie.',
        submittedAt: new Date('2025-03-01'), reviewedAt: new Date('2025-03-02'),
      },
    ];

    const kycs = [];
    for (const k of kycData) {
      const created = await db.kyc.create({ data: k });
      kycs.push(created);
    }
    summary.kycs = kycs.length;

    // ==========================================
    // 11. WALLETS (For all users)
    // ==========================================
    const wallets = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const isSeller = user.role === 'verified_seller';
      let availableBalance: number;
      let escrowBalance: number;
      let totalEarnings: number;

      if (isSeller) {
        // Sellers: higher balances (5000-50000 BDT)
        const sellerBalances = [25000, 18000, 32000, 12500, 45000];
        const sellerEscrow = [3000, 0, 5000, 2000, 0];
        const sellerEarnings = [85000, 42000, 120000, 38000, 150000];
        availableBalance = sellerBalances[i] || 15000;
        escrowBalance = sellerEscrow[i] || 0;
        totalEarnings = sellerEarnings[i] || 50000;
      } else {
        // Buyers: lower balances (100-5000 BDT)
        const buyerBalances = [2500, 800, 1200, 3000, 500, 3500, 1500, 2000, 400, 1800];
        availableBalance = buyerBalances[i - 5] || 1000;
        escrowBalance = 0;
        totalEarnings = 0;
      }

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          availableBalance,
          pendingBalance: 0,
          escrowBalance,
          totalEarnings,
          totalWithdrawn: isSeller ? availableBalance * 0.3 : 0,
        },
      });
      wallets.push(wallet);
    }
    summary.wallets = wallets.length;

    // ==========================================
    // 12. TICKETS (12 - Mix of types, routes, statuses)
    // ==========================================
    const ticketData = [
      // Bus tickets (4)
      {
        ticketId: 'ETR-1', sellerId: sellerIds[0], transportType: 'bus', transportCompany: 'Green Line Paribahan',
        ticketType: 'online_copy', pnrNumber: 'GL-2025-78901', ticketDocument: '/tickets/greenline_dhaka_ctg.pdf',
        routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-06-28', departureTime: '22:00',
        boardingPoint: 'Gabtoli Bus Terminal', droppingPoint: 'Oxygen Mor, Chittagong',
        seatClass: 'AC Sleeper', seatNumber: 'A1', originalPrice: 1200, price: 1350,
        platformFee: 27, totalAmount: 1377, deliveryType: null, description: 'Eid special AC Sleeper seat. Non-refundable after 24h.',
        sellerNotes: 'Please confirm your booking quickly. High demand during Eid.', isConfirmed: true, status: 'active', isFeatured: true, views: 245,
        createdAt: new Date('2025-06-01'),
      },
      {
        ticketId: 'ETR-2', sellerId: sellerIds[1], transportType: 'bus', transportCompany: 'Shyamoli Paribahan',
        ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-06-29', departureTime: '08:00',
        boardingPoint: 'Mohakhali Bus Terminal', droppingPoint: 'Kadamtali, Sylhet',
        seatClass: 'Non AC', seatNumber: '12', originalPrice: 450, price: 550,
        platformFee: 16.5, totalAmount: 566.5, deliveryType: 'in_person', meetingPlace: 'Mohakhali Bus Counter, Gate 3',
        description: 'Counter copy, hand delivery at Mohakhali terminal.', sellerNotes: 'Will meet at the counter 30 mins before departure.',
        isConfirmed: true, status: 'active', views: 89, createdAt: new Date('2025-06-02'),
      },
      {
        ticketId: 'ETR-3', sellerId: sellerIds[2], transportType: 'bus', transportCompany: 'Hanif Enterprise',
        ticketType: 'online_copy', pnrNumber: 'HF-2025-43210', ticketDocument: '/tickets/hanif_dhaka_coxs.pdf',
        routeFrom: 'Dhaka', routeTo: 'Cox\'s Bazar', departureDate: '2025-06-28', departureTime: '21:00',
        boardingPoint: 'Saydabad Bus Terminal', droppingPoint: 'Cox\'s Bazar Bus Stand',
        seatClass: 'AC Business', seatNumber: 'C5', originalPrice: 800, price: 950,
        platformFee: 19, totalAmount: 969, deliveryType: null, description: 'AC Business class, online e-ticket. Direct download.',
        sellerNotes: 'Original ticket from counter, now available as online copy.', isConfirmed: true, status: 'sold', views: 340, createdAt: new Date('2025-06-01'),
      },
      {
        ticketId: 'ETR-4', sellerId: sellerIds[3], transportType: 'bus', transportCompany: 'Desh Travels',
        ticketType: 'counter_copy', routeFrom: 'Chittagong', routeTo: 'Cox\'s Bazar', departureDate: '2025-07-01', departureTime: '06:00',
        boardingPoint: 'Oxygen Mor', droppingPoint: 'Cox\'s Bazar Bus Stand',
        seatClass: 'AC Economy', seatNumber: '8B', originalPrice: 350, price: 400,
        platformFee: 12, totalAmount: 412, deliveryType: 'courier', courierName: 'Pathao Courier', deliverySpeed: 'express', deliveryChargePaidBy: 'buyer', deliveryCharge: 120,
        description: 'AC Economy seat from Chittagong to Cox\'s Bazar.', sellerNotes: 'Courier delivery via Pathao Express.',
        isConfirmed: true, status: 'active', views: 67, createdAt: new Date('2025-06-05'),
      },
      // Train tickets (3)
      {
        ticketId: 'ETR-5', sellerId: sellerIds[0], transportType: 'train', transportCompany: 'Bangladesh Railway',
        ticketType: 'online_copy', pnrNumber: 'BR-2025-12345', ticketDocument: '/tickets/railway_dhaka_ctg.pdf',
        routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-06-29', departureTime: '06:00',
        boardingPoint: 'Kamlapur Railway Station', droppingPoint: 'Chittagong Railway Station',
        seatClass: 'AC Suite Class Sleeper', deckType: 'Lower Deck', seatNumber: 'S-1', coachNumber: 'SN-1',
        originalPrice: 850, price: 1100, platformFee: 22, totalAmount: 1122, deliveryType: null,
        description: 'Suborno Express AC Suite Class. Premium comfort.', sellerNotes: 'Direct train, no stops. Highly sought after during Eid.',
        isConfirmed: true, status: 'active', isFeatured: true, views: 520, createdAt: new Date('2025-06-03'),
      },
      {
        ticketId: 'ETR-6', sellerId: sellerIds[4], transportType: 'train', transportCompany: 'Bangladesh Railway',
        ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-06-30', departureTime: '07:00',
        boardingPoint: 'Kamlapur Railway Station', droppingPoint: 'Sylhet Railway Station',
        seatClass: 'AC Business', seatNumber: 'B-15', coachNumber: 'B-2',
        originalPrice: 500, price: 700, platformFee: 21, totalAmount: 721,
        deliveryType: 'in_person', meetingPlace: 'Kamlapur Station Platform 3',
        description: 'Parabat Express AC Business. Counter copy hand delivery at station.',
        sellerNotes: 'Will deliver at platform 3, 1 hour before departure.', isConfirmed: true, status: 'active', views: 190, createdAt: new Date('2025-06-04'),
      },
      {
        ticketId: 'ETR-7', sellerId: sellerIds[1], transportType: 'train', transportCompany: 'Bangladesh Railway',
        ticketType: 'online_copy', pnrNumber: 'BR-2025-67890', ticketDocument: '/tickets/railway_dhaka_rajshahi.pdf',
        routeFrom: 'Dhaka', routeTo: 'Rajshahi', departureDate: '2025-06-28', departureTime: '16:00',
        boardingPoint: 'Kamlapur Railway Station', droppingPoint: 'Rajshahi Railway Station',
        seatClass: 'Non AC', seatNumber: '45', coachNumber: 'S-7',
        originalPrice: 300, price: 400, platformFee: 8, totalAmount: 408, deliveryType: null,
        description: 'Silk City Express Non-AC. Online e-ticket.',
        sellerNotes: 'Regular class but clean and comfortable.', isConfirmed: true, status: 'expired', views: 55, createdAt: new Date('2025-03-01'),
      },
      // Flight tickets (3)
      {
        ticketId: 'ETR-8', sellerId: sellerIds[2], transportType: 'flight', transportCompany: 'US-Bangla Airlines',
        ticketType: 'online_copy', pnrNumber: 'USB-2025-AB123', ticketDocument: '/tickets/usbangla_dhaka_ctg.pdf',
        routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-06-28', departureTime: '14:30',
        boardingPoint: 'Hazrat Shahjalal International Airport', droppingPoint: 'Shah Amanat International Airport',
        seatClass: 'Economy', seatNumber: '14A', originalPrice: 3000, price: 3500,
        platformFee: 70, totalAmount: 3570, deliveryType: null,
        description: 'US-Bangla Airlines flight, 1-hour journey. Quick and comfortable.',
        sellerNotes: 'Business travel ticket, now reselling due to schedule change.', isConfirmed: true, status: 'active', isFeatured: true, views: 890, createdAt: new Date('2025-06-02'),
      },
      {
        ticketId: 'ETR-9', sellerId: sellerIds[4], transportType: 'flight', transportCompany: 'Biman Bangladesh Airlines',
        ticketType: 'online_copy', pnrNumber: 'BG-2025-CD456', ticketDocument: '/tickets/biman_dhaka_sylhet.pdf',
        routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-07-02', departureTime: '10:00',
        boardingPoint: 'Hazrat Shahjalal International Airport', droppingPoint: 'Osmani International Airport',
        seatClass: 'Economy', seatNumber: '7C', originalPrice: 2500, price: 2800,
        platformFee: 56, totalAmount: 2856, deliveryType: null,
        description: 'Biman Bangladesh domestic flight to Sylhet.',
        sellerNotes: 'Booked for family but one member can\'t travel now.', isConfirmed: true, status: 'active', views: 230, createdAt: new Date('2025-06-06'),
      },
      {
        ticketId: 'ETR-10', sellerId: sellerIds[3], transportType: 'flight', transportCompany: 'Novoair',
        ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: 'Cox\'s Bazar', departureDate: '2025-06-29', departureTime: '11:00',
        boardingPoint: 'Hazrat Shahjalal International Airport', droppingPoint: 'Cox\'s Bazar Airport',
        seatClass: 'Business', seatNumber: '2A', originalPrice: 4500, price: 5000,
        platformFee: 150, totalAmount: 5150, deliveryType: 'in_person', meetingPlace: 'Airport Terminal 1 Gate 5',
        description: 'Novoair Business class. Counter copy, hand delivery at airport.',
        sellerNotes: 'Premium business class seat. Meet at departure gate.', isConfirmed: true, status: 'cancelled', views: 410, createdAt: new Date('2025-06-01'),
      },
      // Launch tickets (2)
      {
        ticketId: 'ETR-11', sellerId: sellerIds[0], transportType: 'launch', transportCompany: 'BIWTC Launch Service',
        ticketType: 'online_copy', pnrNumber: 'BIWTC-2025-345', ticketDocument: '/tickets/biwtc_dhaka_barisal.pdf',
        routeFrom: 'Dhaka', routeTo: 'Barisal', departureDate: '2025-06-29', departureTime: '18:00',
        boardingPoint: 'Sadarghat Launch Terminal', droppingPoint: 'Barisal Launch Terminal',
        seatClass: 'AC Double Decker', deckType: 'Upper Deck', seatNumber: 'UD-12',
        originalPrice: 600, price: 800, platformFee: 16, totalAmount: 816, deliveryType: null,
        description: 'BIWTC Launch, AC Double Decker cabin. Overnight journey.',
        sellerNotes: 'Comfortable overnight launch journey. Cabin with AC.', isConfirmed: true, status: 'active', views: 150, createdAt: new Date('2025-06-03'),
      },
      {
        ticketId: 'ETR-12', sellerId: sellerIds[4], transportType: 'launch', transportCompany: 'Sadharan Bima Launch',
        ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: 'Khulna', departureDate: '2025-06-30', departureTime: '20:00',
        boardingPoint: 'Sadarghat Launch Terminal', droppingPoint: 'Khulna Launch Terminal',
        seatClass: 'AC Economy', seatNumber: 'EC-25',
        originalPrice: 400, price: 500, platformFee: 15, totalAmount: 515,
        deliveryType: 'courier', courierName: 'Steadfast', deliverySpeed: 'normal', deliveryChargePaidBy: 'seller', deliveryCharge: 60,
        description: 'Sadharan Bima Launch to Khulna. Counter copy, courier delivery.',
        sellerNotes: 'Free courier delivery included via Steadfast.', isConfirmed: true, status: 'active', views: 75, createdAt: new Date('2025-06-05'),
      },
    ];

    const tickets = [];
    for (const t of ticketData) {
      const created = await db.ticket.create({ data: t });
      tickets.push(created);
    }
    summary.tickets = tickets.length;

    // ==========================================
    // 13. ORDERS (8 - Mix of statuses)
    // ==========================================
    // Get user IDs by role
    const allBuyerIds = users.filter(u => u.role === 'user').map(u => u.id);
    const allSellerIds = users.filter(u => u.role === 'verified_seller').map(u => u.id);

    const orderData = [
      // Order 1: Completed (online_copy bus ticket)
      {
        orderId: 'ORD-1', ticketId: tickets[0].id, buyerId: allBuyerIds[0], sellerId: sellerIds[0],
        amount: 1350, platformFee: 27, totalAmount: 1377,
        escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'online_pdf',
        deliveryStatus: 'confirmed', status: 'completed',
        completedAt: new Date('2025-06-15'),
        createdAt: new Date('2025-06-10'),
      },
      // Order 2: Completed (counter_copy bus, in_person)
      {
        orderId: 'ORD-2', ticketId: tickets[1].id, buyerId: allBuyerIds[3], sellerId: sellerIds[1],
        amount: 550, platformFee: 16.5, totalAmount: 566.5,
        escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'in_person',
        deliveryStatus: 'confirmed', status: 'completed',
        completedAt: new Date('2025-06-20'),
        createdAt: new Date('2025-06-12'),
      },
      // Order 3: Confirmed (online_copy train)
      {
        orderId: 'ORD-3', ticketId: tickets[4].id, buyerId: allBuyerIds[0], sellerId: sellerIds[0],
        amount: 1100, platformFee: 22, totalAmount: 1122,
        escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'online_pdf',
        deliveryStatus: 'pending', status: 'confirmed',
        createdAt: new Date('2025-06-25'),
      },
      // Order 4: Pending (counter_copy train, in_person)
      {
        orderId: 'ORD-4', ticketId: tickets[5].id, buyerId: allBuyerIds[5], sellerId: sellerIds[4],
        amount: 700, platformFee: 21, totalAmount: 721,
        escrowStatus: 'held', paymentStatus: 'pending', deliveryMethod: 'in_person',
        deliveryStatus: 'pending', status: 'pending',
        createdAt: new Date('2025-06-26'),
      },
      // Order 5: Completed (online_copy flight)
      {
        orderId: 'ORD-5', ticketId: tickets[7].id, buyerId: allBuyerIds[2], sellerId: sellerIds[2],
        amount: 3500, platformFee: 70, totalAmount: 3570,
        escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'online_pdf',
        deliveryStatus: 'confirmed', status: 'completed',
        completedAt: new Date('2025-06-22'),
        createdAt: new Date('2025-06-18'),
      },
      // Order 6: Cancelled (counter_copy bus, courier)
      {
        orderId: 'ORD-6', ticketId: tickets[3].id, buyerId: allBuyerIds[4], sellerId: sellerIds[3],
        amount: 400, platformFee: 12, totalAmount: 412,
        escrowStatus: 'refunded', paymentStatus: 'refunded', deliveryMethod: 'courier',
        deliveryStatus: 'pending', status: 'cancelled',
        cancelledAt: new Date('2025-06-28'),
        createdAt: new Date('2025-06-22'),
      },
      // Order 7: In Progress (online_copy launch)
      {
        orderId: 'ORD-7', ticketId: tickets[10].id, buyerId: allBuyerIds[6], sellerId: sellerIds[0],
        amount: 800, platformFee: 16, totalAmount: 816,
        escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'online_pdf',
        deliveryStatus: 'delivered', status: 'in_progress',
        createdAt: new Date('2025-06-27'),
      },
      // Order 8: Disputed (counter_copy train)
      {
        orderId: 'ORD-8', ticketId: tickets[5].id, buyerId: allBuyerIds[7], sellerId: sellerIds[4],
        amount: 700, platformFee: 21, totalAmount: 721,
        escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'in_person',
        deliveryStatus: 'pending', status: 'disputed',
        createdAt: new Date('2025-06-28'),
      },
    ];

    const orders = [];
    for (const o of orderData) {
      const created = await db.order.create({ data: o });
      orders.push(created);
    }
    summary.orders = orders.length;

    // ==========================================
    // 14. WALLET TRANSACTIONS (15)
    // ==========================================
    const walletIds = wallets.map(w => w.id);
    const sellerWalletIds = wallets.filter(w => users.find(u => u.id === w.userId)?.role === 'verified_seller').map(w => w.id);

    const transactionData = [
      // Seller transactions (credit from completed orders)
      { walletId: sellerWalletIds[0], type: 'credit', amount: 1350, balance: 26350, description: 'Payment received for ETR-1 (Dhaka-Chittagong Bus)', orderId: orders[0].id, createdAt: new Date('2025-06-15') },
      { walletId: sellerWalletIds[1], type: 'credit', amount: 550, balance: 18550, description: 'Payment received for ETR-2 (Dhaka-Sylhet Bus)', orderId: orders[1].id, createdAt: new Date('2025-06-20') },
      { walletId: sellerWalletIds[2], type: 'credit', amount: 3500, balance: 35500, description: 'Payment received for ETR-8 (US-Bangla Flight)', orderId: orders[4].id, createdAt: new Date('2025-06-22') },
      // Escrow hold transactions
      { walletId: sellerWalletIds[0], type: 'escrow_hold', amount: 1100, balance: 25250, description: 'Escrow held for ETR-5 (Dhaka-Chittagong Train)', orderId: orders[2].id, createdAt: new Date('2025-06-25') },
      { walletId: sellerWalletIds[4], type: 'escrow_hold', amount: 700, balance: 11800, description: 'Escrow held for ETR-6 (Dhaka-Sylhet Train)', orderId: orders[3].id, createdAt: new Date('2025-06-26') },
      { walletId: sellerWalletIds[0], type: 'escrow_hold', amount: 800, balance: 24450, description: 'Escrow held for ETR-11 (Dhaka-Barisal Launch)', orderId: orders[6].id, createdAt: new Date('2025-06-27') },
      // Escrow release
      { walletId: sellerWalletIds[0], type: 'escrow_release', amount: 1350, balance: 25000, description: 'Escrow released for completed order ORD-1', orderId: orders[0].id, createdAt: new Date('2025-06-15T12:00:00') },
      { walletId: sellerWalletIds[1], type: 'escrow_release', amount: 550, balance: 18000, description: 'Escrow released for completed order ORD-2', orderId: orders[1].id, createdAt: new Date('2025-06-20T12:00:00') },
      // Buyer debit transactions
      { walletId: walletIds[5], type: 'debit', amount: 1377, balance: 1123, description: 'Payment for ticket ETR-1 (Green Line Bus)', orderId: orders[0].id, createdAt: new Date('2025-06-10') },
      { walletId: walletIds[8], type: 'debit', amount: 1122, balance: 1878, description: 'Payment for ticket ETR-5 (Bangladesh Railway)', orderId: orders[2].id, createdAt: new Date('2025-06-25') },
      { walletId: walletIds[7], type: 'debit', amount: 3570, balance: -570, description: 'Payment for ticket ETR-8 (US-Bangla Flight)', orderId: orders[4].id, createdAt: new Date('2025-06-18') },
      // Escrow refund
      { walletId: walletIds[9], type: 'credit', amount: 412, balance: 912, description: 'Refund for cancelled order ORD-6', orderId: orders[5].id, createdAt: new Date('2025-06-28') },
      { walletId: sellerWalletIds[3], type: 'escrow_refund', amount: 400, balance: 12500, description: 'Escrow refunded for cancelled order ORD-6', orderId: orders[5].id, createdAt: new Date('2025-06-28') },
      // Wallet top-up
      { walletId: walletIds[5], type: 'credit', amount: 2500, balance: 2500, description: 'Wallet top-up via bKash', createdAt: new Date('2025-06-01') },
      { walletId: walletIds[8], type: 'credit', amount: 3000, balance: 3000, description: 'Wallet top-up via bKash', createdAt: new Date('2025-06-05') },
    ];

    const transactions = [];
    for (const t of transactionData) {
      const created = await db.transaction.create({ data: t });
      transactions.push(created);
    }
    summary.transactions = transactions.length;

    // ==========================================
    // 15. WITHDRAWALS (5)
    // ==========================================
    const withdrawalData = [
      {
        walletId: sellerWalletIds[0], amount: 8000, method: 'bkash',
        accountDetails: 'bKash: +8801711234501, Name: Karim Uddin',
        status: 'completed', reviewedBy: admins[0].id, reviewNote: 'Processed via bKash.',
        createdAt: new Date('2025-05-15'), updatedAt: new Date('2025-05-16'),
      },
      {
        walletId: sellerWalletIds[2], amount: 15000, method: 'bank_transfer',
        accountDetails: 'Bank: Dutch-Bangla Bank, A/C: Zahid Hassan, A/C No: 1234567890, Branch: Agrabad, Chittagong',
        status: 'completed', reviewedBy: admins[0].id, reviewNote: 'Bank transfer processed.',
        createdAt: new Date('2025-05-20'), updatedAt: new Date('2025-05-23'),
      },
      {
        walletId: sellerWalletIds[1], amount: 5000, method: 'bkash',
        accountDetails: 'bKash: +8801811234502, Name: Rahim Khan',
        status: 'pending', reviewedBy: null, reviewNote: null,
        createdAt: new Date('2025-06-28'),
      },
      {
        walletId: sellerWalletIds[4], amount: 20000, method: 'bank_transfer',
        accountDetails: 'Bank: Sonali Bank, A/C: Aminul Islam, A/C No: 9876543210, Branch: Rajshahi',
        status: 'approved', reviewedBy: admins[1].id, reviewNote: 'Approved. Processing in 3 business days.',
        createdAt: new Date('2025-06-25'), updatedAt: new Date('2025-06-26'),
      },
      {
        walletId: sellerWalletIds[3], amount: 3000, method: 'bkash',
        accountDetails: 'bKash: +8801511234504, Name: Tanvir Ahmed',
        status: 'rejected', reviewedBy: admins[1].id, reviewNote: 'Minimum withdrawal amount is ৳500. Please resubmit with correct amount.',
        createdAt: new Date('2025-06-27'), updatedAt: new Date('2025-06-27'),
      },
    ];

    const withdrawals = [];
    for (const w of withdrawalData) {
      const created = await db.withdrawal.create({ data: w });
      withdrawals.push(created);
    }
    summary.withdrawals = withdrawals.length;

    // ==========================================
    // 16. REVIEWS (5 - Ratings 1-5)
    // ==========================================
    const reviewData = [
      {
        orderId: orders[0].id, authorId: allBuyerIds[0], targetId: sellerIds[0],
        rating: 5, comment: 'Excellent seller! Ticket was delivered instantly as online copy. Very smooth experience during Eid rush.',
        createdAt: new Date('2025-06-16'),
      },
      {
        orderId: orders[1].id, authorId: allBuyerIds[3], targetId: sellerIds[1],
        rating: 4, comment: 'Good seller, met at the bus counter as promised. Slight delay but ticket was genuine.',
        createdAt: new Date('2025-06-21'),
      },
      {
        orderId: orders[4].id, authorId: allBuyerIds[2], targetId: sellerIds[2],
        rating: 5, comment: 'US-Bangla flight ticket was genuine and received PDF within minutes. Best platform for flight tickets!',
        createdAt: new Date('2025-06-23'),
      },
      {
        orderId: orders[5].id, authorId: allBuyerIds[4], targetId: sellerIds[3],
        rating: 2, comment: 'Had to cancel the order due to personal emergency. Seller was not very responsive to messages.',
        createdAt: new Date('2025-06-29'),
      },
      {
        orderId: orders[0].id, authorId: sellerIds[0], targetId: allBuyerIds[0],
        rating: 5, comment: 'Great buyer, paid promptly and confirmed delivery quickly. No issues at all.',
        createdAt: new Date('2025-06-17'),
      },
    ];

    const reviews = [];
    for (const r of reviewData) {
      const created = await db.review.create({ data: r });
      reviews.push(created);
    }
    summary.reviews = reviews.length;

    // ==========================================
    // 17. NOTIFICATIONS (10)
    // ==========================================
    const notificationData = [
      { userId: allBuyerIds[0], title: 'Ticket Purchased Successfully', message: 'You have successfully purchased ETR-1 (Green Line Bus, Dhaka→Chittagong). Check your orders for details.', type: 'success' },
      { userId: sellerIds[0], title: 'New Order Received', message: 'A buyer has purchased your ticket ETR-1. The payment is held in escrow and will be released upon confirmation.', type: 'info' },
      { userId: allBuyerIds[3], title: 'Order Completed', message: 'Your order ORD-2 for Dhaka→Sylhet bus ticket has been completed. The seller has been paid.', type: 'success' },
      { userId: allBuyerIds[5], title: 'KYC Verification Pending', message: 'Your KYC verification is under review. You will be notified once it is processed.', type: 'info' },
      { userId: allBuyerIds[5], title: 'KYC Rejected', message: 'Your KYC verification was rejected. Reason: Selfie does not match NID photo. Please resubmit with a clear selfie.', type: 'error' },
      { userId: sellerIds[1], title: 'Withdrawal Processing', message: 'Your withdrawal request of ৳5,000 via bKash is being processed. It will be completed within 3 business days.', type: 'info' },
      { userId: allBuyerIds[4], title: 'Order Cancelled - Refund Issued', message: 'Your order ORD-6 has been cancelled. ৳412 has been refunded to your wallet.', type: 'warning' },
      { userId: allBuyerIds[6], title: 'Eid Special Offer!', message: 'Use code EID2025 for 10% off on all tickets. Offer valid until July 1, 2025.', type: 'info' },
      { userId: sellerIds[0], title: 'Escrow Released', message: 'Escrow of ৳1,350 for order ORD-1 has been released to your wallet.', type: 'success' },
      { userId: allBuyerIds[7], title: 'New Ticket Available', message: 'A new ticket for Dhaka→Sylhet train is now available! Check it out before it\'s sold.', type: 'info', isRead: true },
    ];

    const notifications = [];
    for (const n of notificationData) {
      const created = await db.notification.create({ data: n });
      notifications.push(created);
    }
    summary.notifications = notifications.length;

    // ==========================================
    // 18. SUPPORT TICKETS (5)
    // ==========================================
    const supportTicketData = [
      {
        userId: allBuyerIds[4], fullName: 'Mahbub Alam', phone: '+8801611234511', email: 'mahbub@example.com',
        subject: 'Payment Issue - Money Deducted but Order Not Confirmed',
        message: 'I paid ৳412 for ticket ETR-4 but the order was cancelled. The money was deducted from my wallet but I haven\'t received a refund yet. Please help.',
        status: 'resolved', priority: 'high',
        createdAt: new Date('2025-06-28'), updatedAt: new Date('2025-06-29'),
      },
      {
        userId: allBuyerIds[1], fullName: 'Nasreen Akter', phone: '+8801711234507', email: 'nasreen@example.com',
        subject: 'Ticket Not Received - Online Copy Download Failed',
        message: 'I purchased an online copy ticket but the download link is not working. I get a 404 error when trying to download the PDF. My order ID is ORD-3.',
        status: 'in_progress', priority: 'medium',
        createdAt: new Date('2025-06-26'), updatedAt: new Date('2025-06-27'),
      },
      {
        userId: null, fullName: 'Guest User', phone: '+8801711999999', email: 'guestuser@gmail.com',
        subject: 'Cannot Register - Phone Verification OTP Not Received',
        message: 'I tried to register but the OTP for phone verification was never sent. I\'ve tried multiple times with my number +8801711999999.',
        status: 'open', priority: 'medium',
        createdAt: new Date('2025-06-30'),
      },
      {
        userId: sellerIds[3], fullName: 'Tanvir Ahmed', phone: '+8801511234504', email: 'tanvir@example.com',
        subject: 'Withdrawal Rejected - Need Clarification',
        message: 'My withdrawal of ৳3,000 was rejected with a note about minimum amount. But I requested ৳3,000 which is above the ৳500 minimum. Please clarify.',
        status: 'open', priority: 'low',
        createdAt: new Date('2025-06-28'),
      },
      {
        userId: allBuyerIds[2], fullName: 'Sabina Yasmin', phone: '+8801811234508', email: 'sabina@example.com',
        subject: 'Counter Copy Delivery - Courier Not Responding',
        message: 'I ordered a counter copy ticket with courier delivery via Steadfast. The courier tracking shows no update for 5 days. Seller says they sent it. I need help tracking my delivery.',
        status: 'open', priority: 'urgent',
        createdAt: new Date('2025-06-30'),
      },
    ];

    const supportTickets = [];
    for (const st of supportTicketData) {
      const created = await db.supportTicket.create({ data: st });
      supportTickets.push(created);
    }
    summary.supportTickets = supportTickets.length;

    // ==========================================
    // 19. BLOG POSTS (5 - Published)
    // ==========================================
    const blogPostsData = [
      {
        title: 'How to Book Bus Tickets During Eid Rush in Bangladesh',
        slug: 'how-to-book-bus-tickets-eid-bangladesh',
        content: 'Eid is the busiest travel season in Bangladesh. Millions of people travel from Dhaka to their hometowns across the country. Here are our top tips for booking bus tickets during the Eid rush:\n\n1. **Book Early**: Start looking for tickets at least 2 weeks before Eid day.\n2. **Use Online Platforms**: Avoid long queues at bus counters by using online booking.\n3. **Verify Your Ticket**: Always verify the ticket PNR number before traveling.\n4. **Choose AC Services**: During hot summer months, AC buses provide comfortable travel.\n5. **Plan Return Journey**: Book return tickets simultaneously to avoid last-minute hassle.\n\nPopular routes during Eid include Dhaka→Chittagong, Dhaka→Sylhet, Dhaka→Cox\'s Bazar, and Dhaka→Rajshahi.',
        excerpt: 'Essential tips for booking bus tickets during Bangladesh\'s busiest travel season - Eid.',
        author: 'Eid Ticket Resell Team',
        categoryId: blogCategories[0].id,
        isPublished: true, publishedAt: new Date('2025-03-15'),
        createdAt: new Date('2025-03-10'),
      },
      {
        title: 'Eid Travel Guide: Train vs Bus vs Flight - Which is Best?',
        slug: 'eid-travel-guide-train-bus-flight',
        content: 'When traveling during Eid in Bangladesh, you have several transport options. Each has its advantages:\n\n**Train**: Most comfortable for long journeys. Bangladesh Railway operates Suborno Express, Parabat Express, and other premium services. Book early as seats fill up fast.\n\n**Bus**: Most flexible with many routes and companies. Green Line, Shyamoli, and Hanif are popular AC services. Counter tickets are common.\n\n**Flight**: Fastest option (1-2 hours). US-Bangla, Novoair, and Biman Bangladesh offer domestic flights. More expensive but saves time.\n\n**Launch**: Ideal for southern routes (Dhaka→Barisal, Dhaka→Khulna). Overnight journey, comfortable cabins available.\n\nChoose based on your budget, time, and destination!',
        excerpt: 'Comparing train, bus, flight, and launch options for Eid travel in Bangladesh.',
        author: 'Eid Ticket Resell Team',
        categoryId: blogCategories[1].id,
        isPublished: true, publishedAt: new Date('2025-04-01'),
        createdAt: new Date('2025-03-25'),
      },
      {
        title: 'Safety Tips for Travelers During Eid Season',
        slug: 'safety-tips-eid-travelers-bangladesh',
        content: 'Eid travel season brings heavy traffic and crowded terminals. Follow these safety tips:\n\n1. **Verify Tickets**: Always verify your ticket with the original PNR before boarding.\n2. **Avoid Counter Black Market**: Don\'t buy tickets from unauthorized sellers at terminals.\n3. **Keep Digital Copies**: Save e-ticket PDFs on your phone as backup.\n4. **Travel During Off-Peak**: If possible, travel 1-2 days before or after peak Eid days.\n5. **Secure Your Belongings**: Keep valuables close, especially in crowded terminals.\n6. **Emergency Contacts**: Save emergency numbers for transport authorities.\n\nStay safe and enjoy your Eid journey with family!',
        excerpt: 'Important safety guidelines for travelers during Bangladesh\'s Eid season.',
        author: 'Eid Ticket Resell Team',
        categoryId: blogCategories[2].id,
        isPublished: true, publishedAt: new Date('2025-04-10'),
        createdAt: new Date('2025-04-05'),
      },
      {
        title: 'Best AC Bus Services in Bangladesh for Comfortable Travel',
        slug: 'best-ac-bus-services-bangladesh',
        content: 'Bangladesh has several premium AC bus services that offer comfortable long-distance travel:\n\n**Green Line Paribahan**: Known for AC Sleeper and AC Business class. Dhaka-Chittagong and Dhaka-Cox\'s Bazar routes. Very popular during Eid.\n\n**Shyamoli Paribahan**: Offers both AC and Non-AC services. Wide network covering major districts.\n\n**Hanif Enterprise**: One of the largest bus operators. AC Business class with comfortable seating.\n\n**Desh Travels**: Reliable AC services on major routes. Good for Rajshahi and Khulna routes.\n\nWhen choosing, consider route coverage, seat type (sleeper vs chair), and departure time.',
        excerpt: 'Review of Bangladesh\'s top AC bus services for comfortable travel.',
        author: 'Eid Ticket Resell Team',
        categoryId: blogCategories[0].id,
        isPublished: true, publishedAt: new Date('2025-05-01'),
        createdAt: new Date('2025-04-25'),
      },
      {
        title: 'Understanding Bangladesh Railway Classes and Seat Types',
        slug: 'bangladesh-railway-classes-seat-types',
        content: 'Bangladesh Railway offers several classes for comfortable train travel:\n\n**AC Suite Class Sleeper**: Premium private cabins with beds. Available on Suborno Express. Most expensive but most comfortable.\n\n**AC Business**: Comfortable reclining seats with AC. Available on most intercity trains.\n\n**AC Economy**: Budget-friendly AC option. Good seats but more crowded.\n\n**Non AC (Shovan/Snigdha)**: Cheapest options. No AC but still decent for short routes.\n\nPopular trains: Suborno Express (Dhaka-Chittagong), Parabat Express (Dhaka-Sylhet), Silk City Express (Dhaka-Rajshahi), Padma Express (Dhaka-Khulna).\n\nAlways check the coach number and seat number on your ticket before boarding!',
        excerpt: 'Guide to Bangladesh Railway\'s different seat classes and what to expect.',
        author: 'Eid Ticket Resell Team',
        categoryId: blogCategories[0].id,
        isPublished: true, publishedAt: new Date('2025-05-15'),
        createdAt: new Date('2025-05-10'),
      },
    ];

    const blogPosts = [];
    for (const bp of blogPostsData) {
      const created = await db.blogPost.create({ data: bp });
      blogPosts.push(created);
    }
    summary.blogPosts = blogPosts.length;

    // ==========================================
    // 20. DISPUTES (2)
    // ==========================================
    const disputeData = [
      {
        orderId: orders[7].id, initiatedBy: 'buyer',
        reason: 'Seller did not deliver the counter copy ticket at the agreed meeting place',
        description: 'I arrived at Kamlapur Station Platform 3 as agreed, but the seller did not show up. I waited for 1 hour and tried to contact them via chat but got no response. The train departed and I missed my journey.',
        status: 'open',
        createdAt: new Date('2025-06-28'), updatedAt: new Date('2025-06-28'),
      },
      {
        orderId: orders[2].id, initiatedBy: 'seller',
        reason: 'Buyer claims ticket is invalid but PNR verification shows it is genuine',
        description: 'The buyer filed a complaint saying the train ticket PNR number is not valid. I have verified with Bangladesh Railway that the PNR BR-2025-12345 is a valid booking. The buyer may be trying to get a refund after using the ticket.',
        status: 'investigating',
        createdAt: new Date('2025-06-26'), updatedAt: new Date('2025-06-27'),
      },
    ];

    const disputes = [];
    for (const d of disputeData) {
      const created = await db.dispute.create({ data: d });
      disputes.push(created);
    }
    summary.disputes = disputes.length;

    // ==========================================
    // 21. CHATS + CHAT PARTICIPANTS + MESSAGES (3)
    // ==========================================
    // Create chats for 3 orders
    const chatOrders = [orders[0], orders[1], orders[2]];
    const chatData = [
      {
        orderId: chatOrders[0].id,
        participants: [
          { userId: allBuyerIds[0] },
          { userId: sellerIds[0] },
        ],
        messages: [
          { senderId: allBuyerIds[0], content: 'Hi! I just purchased your Green Line bus ticket. Can you share the PDF?', createdAt: new Date('2025-06-10T10:00:00') },
          { senderId: sellerIds[0], content: 'Sure! The PDF download link is available in your order details. Let me confirm the PNR for you.', createdAt: new Date('2025-06-10T10:05:00') },
          { senderId: sellerIds[0], content: 'PNR: GL-2025-78901. Verified with Green Line counter. You can download it now.', createdAt: new Date('2025-06-10T10:10:00') },
          { senderId: allBuyerIds[0], content: 'Got it! Downloaded the PDF. Everything looks correct. Thank you!', createdAt: new Date('2025-06-10T10:15:00') },
          { senderId: sellerIds[0], content: 'Great! Please confirm delivery once you board the bus. Happy Eid journey!', createdAt: new Date('2025-06-10T10:20:00') },
        ],
      },
      {
        orderId: chatOrders[1].id,
        participants: [
          { userId: allBuyerIds[3] },
          { userId: sellerIds[1] },
        ],
        messages: [
          { senderId: allBuyerIds[3], content: 'Hello, I bought your Shyamoli counter copy ticket. Where exactly should we meet?', createdAt: new Date('2025-06-12T08:00:00') },
          { senderId: sellerIds[1], content: 'Mohakhali Bus Terminal, Gate 3. I\'ll be there 30 mins before departure at 7:30 AM.', createdAt: new Date('2025-06-12T08:05:00') },
          { senderId: allBuyerIds[3], content: 'OK, I\'ll be there. What does the ticket look like so I can identify it?', createdAt: new Date('2025-06-12T08:10:00') },
          { senderId: sellerIds[1], content: 'It\'s a standard Shyamoli counter receipt with seat number 12. I\'ll hand it to you directly.', createdAt: new Date('2025-06-12T08:15:00') },
        ],
      },
      {
        orderId: chatOrders[2].id,
        participants: [
          { userId: allBuyerIds[0] },
          { userId: sellerIds[0] },
        ],
        messages: [
          { senderId: allBuyerIds[0], content: 'I just purchased the Suborno Express train ticket. Is the PDF ready for download?', createdAt: new Date('2025-06-25T14:00:00') },
          { senderId: sellerIds[0], content: 'Yes, the PDF is available. This is an AC Suite Class Sleeper ticket - very premium!', createdAt: new Date('2025-06-25T14:05:00') },
          { senderId: allBuyerIds[0], content: 'Great! I see the download link. PNR BR-2025-12345 looks correct. When should I confirm delivery?', createdAt: new Date('2025-06-25T14:10:00') },
        ],
      },
    ];

    const chatsCreated = [];
    const messagesCreated = [];
    for (const cd of chatData) {
      const chat = await db.chat.create({ data: { orderId: cd.orderId } });
      chatsCreated.push(chat);

      // Create participants
      for (const p of cd.participants) {
        await db.chatParticipant.create({ data: { chatId: chat.id, userId: p.userId } });
      }

      // Create messages
      for (const m of cd.messages) {
        const msg = await db.message.create({
          data: { chatId: chat.id, senderId: m.senderId, content: m.content, createdAt: m.createdAt },
        });
        messagesCreated.push(msg);
      }
    }
    summary.chats = chatsCreated.length;
    summary.chatParticipants = 6; // 2 per chat
    summary.messages = messagesCreated.length;

    // ==========================================
    // 22. JOURNEY VERIFICATIONS (2)
    // ==========================================
    const journeyVerificationData = [
      {
        orderId: orders[0].id, buyerId: allBuyerIds[0],
        photo: '/journey/greenline_bus_photo.jpg',
        gpsLat: 23.8061, gpsLng: 90.3687,
        gpsTimestamp: new Date('2025-06-28T22:30:00'),
        status: 'verified',
        submittedAt: new Date('2025-06-28T22:30:00'),
        verifiedAt: new Date('2025-06-29T08:00:00'),
      },
      {
        orderId: orders[6].id, buyerId: allBuyerIds[6],
        photo: '/journey/barisal_launch_photo.jpg',
        video: '/journey/barisal_launch_clip.mp4',
        gpsLat: 22.3354, gpsLng: 91.8126,
        gpsTimestamp: new Date('2025-06-29T20:00:00'),
        status: 'submitted',
        submittedAt: new Date('2025-06-29T20:00:00'),
      },
    ];

    const journeyVerifications = [];
    for (const jv of journeyVerificationData) {
      const created = await db.journeyVerification.create({ data: jv });
      journeyVerifications.push(created);
    }
    summary.journeyVerifications = journeyVerifications.length;

    // ==========================================
    // 23. ADMIN ACTIVITY LOGS (5)
    // ==========================================
    const adminActivityData = [
      {
        adminId: admins[0].id, action: 'approved_kyc', details: 'Approved KYC for Karim Uddin (user: karim_seller). NID verified.',
        ipAddress: '192.168.1.1', createdAt: new Date('2025-01-16'),
      },
      {
        adminId: admins[0].id, action: 'approved_kyc', details: 'Approved KYC for Rahim Khan (user: rahim_tickets). NID and selfie match confirmed.',
        ipAddress: '192.168.1.1', createdAt: new Date('2025-01-21'),
      },
      {
        adminId: admins[1].id, action: 'processed_withdrawal', details: 'Processed withdrawal of ৳15,000 for Zahid Hassan via bank transfer to Dutch-Bangla Bank.',
        ipAddress: '192.168.1.2', createdAt: new Date('2025-05-23'),
      },
      {
        adminId: admins[0].id, action: 'rejected_kyc', details: 'Rejected KYC for Imran Hossain. Reason: Selfie does not match NID photo.',
        ipAddress: '192.168.1.1', createdAt: new Date('2025-03-02'),
      },
      {
        adminId: admins[1].id, action: 'resolved_support_ticket', details: 'Resolved support ticket from Mahbub Alam regarding payment refund for cancelled order ORD-6.',
        ipAddress: '192.168.1.2', createdAt: new Date('2025-06-29'),
      },
    ];

    const adminActivities = [];
    for (const aa of adminActivityData) {
      const created = await db.adminActivityLog.create({ data: aa });
      adminActivities.push(created);
    }
    summary.adminActivityLogs = adminActivities.length;

    // ==========================================
    // RETURN SUMMARY
    // ==========================================
    return NextResponse.json({
      message: 'Database seeded successfully with comprehensive Bangladesh data',
      summary,
      credentials: {
        superAdmin: { email: 'admin@eidticketresell.com', password: 'admin123' },
        moderator: { email: 'moderator@eidticketresell.com', password: 'admin123' },
        supportStaff: { email: 'support@eidticketresell.com', password: 'admin123' },
        userPassword: 'user1234',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      error: 'Internal server error during seeding',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
