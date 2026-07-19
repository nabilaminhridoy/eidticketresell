import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Check if already seeded
    const adminUser = await db.user.findUnique({
      where: { email: 'admin@eidticket.com' },
    });

    if (adminUser) {
      return NextResponse.json(
        { error: 'Database already seeded. Use fresh database to seed again.' },
        { status: 409 }
      );
    }

    const hashedAdminPw = await hashPassword('admin123');
    const hashedUserPw = await hashPassword('user1234');
    const hashedSellerPw = await hashPassword('seller123');

    // 1. Create admin user
    const admin = await db.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@eidticket.com',
        phone: '+8801711111111',
        username: 'admin',
        password: hashedAdminPw,
        role: 'admin',
        isKycVerified: true,
        emailVerified: true,
        isActive: true,
      },
    });

    await db.wallet.create({
      data: {
        userId: admin.id,
        availableBalance: 0,
        pendingBalance: 0,
        escrowBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
      },
    });

    // 2. Create 5 regular users
    const regularUsers = [];
    for (let i = 1; i <= 5; i++) {
      const user = await db.user.create({
        data: {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          phone: `+880171111111${i + 1}`,
          username: `user${i}`,
          password: hashedUserPw,
          role: 'user',
          isKycVerified: false,
          emailVerified: true,
          isActive: true,
        },
      });
      await db.wallet.create({
        data: {
          userId: user.id,
          availableBalance: 1000 * i,
          pendingBalance: 0,
          escrowBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0,
        },
      });
      regularUsers.push(user);
    }

    // 3. Create 3 verified sellers
    const sellers = [];
    const sellerNames = ['Karim Transport', 'Rahim Tickets', 'Jamal Travels'];
    for (let i = 0; i < 3; i++) {
      const seller = await db.user.create({
        data: {
          name: sellerNames[i],
          email: `seller${i + 1}@example.com`,
          phone: `+880172222222${i + 1}`,
          username: `seller${i + 1}`,
          password: hashedSellerPw,
          role: 'verified_seller',
          isKycVerified: true,
          emailVerified: true,
          isActive: true,
        },
      });
      await db.wallet.create({
        data: {
          userId: seller.id,
          availableBalance: 5000 + i * 2000,
          pendingBalance: 1000,
          escrowBalance: 2000,
          totalEarnings: 15000 + i * 5000,
          totalWithdrawn: 8000 + i * 2000,
        },
      });

      // Create KYC record for each seller
      await db.kyc.create({
        data: {
          userId: seller.id,
          kycName: sellerNames[i],
          kycDob: `199${i}-01-15`,
          kycGender: 'male',
          documentType: 'nid',
          documentNumber: `NID-1990${i}0000${i + 1}`,
          documentFront: '/uploads/nid-front-sample.jpg',
          documentBack: '/uploads/nid-back-sample.jpg',
          selfiePhoto: '/uploads/selfie-sample.jpg',
          houseRoadVillage: 'House 12, Road 5',
          upazilaThana: 'Dhanmondi',
          district: 'Dhaka',
          division: 'dhaka',
          status: 'approved',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });

      sellers.push(seller);
    }

    // 4. Create transport companies
    const companies = [
      { name: 'Shyamoli NR Travels', nameBn: 'শ্যামলী এনআর ট্রাভেলস', type: 'bus' },
      { name: 'Green Line', nameBn: 'গ্রিন লাইন', type: 'bus' },
      { name: 'Shohagh Paribahan', nameBn: 'সোহাগ পরিবহন', type: 'bus' },
      { name: 'Ena Transport', nameBn: 'ইনা ট্রান্সপোর্ট', type: 'bus' },
      { name: 'Bangladesh Railway', nameBn: 'বাংলাদেশ রেলওয়ে', type: 'train' },
      { name: 'Sonar Bangla Express', nameBn: 'সোনার বাংলা এক্সপ্রেস', type: 'train' },
      { name: 'Suborno Express', nameBn: 'সুবর্ণ এক্সপ্রেস', type: 'train' },
      { name: 'Biman Bangladesh Airlines', nameBn: 'বিমান বাংলাদেশ এয়ারলাইন্স', type: 'flight' },
      { name: 'US-Bangla Airlines', nameBn: 'ইউএস-বাংলা এয়ারলাইন্স', type: 'flight' },
      { name: 'Novoair', nameBn: 'নভোএয়ার', type: 'flight' },
      { name: 'Bangladesh Shipping Corporation', nameBn: 'বাংলাদেশ শিপিং কর্পোরেশন', type: 'launch' },
      { name: 'Sundarban Launch Service', nameBn: 'সুন্দরবন লঞ্চ সার্ভিস', type: 'launch' },
    ];

    for (const company of companies) {
      await db.transportCompany.create({
        data: company,
      });
    }

    // 5. Create 12 sample tickets (3 bus, 3 train, 3 flight, 3 launch)
    const ticketData = [
      // Bus tickets
      {
        transportType: 'bus',
        transportCompany: 'Shyamoli NR Travels',
        routeFrom: 'Dhaka',
        routeTo: 'Chittagong',
        departureDate: '2025-03-28',
        departureTime: '22:00',
        seatNumber: 'A1',
        seatType: 'AC',
        coachNumber: 'TA-1024',
        ticketType: 'online_copy',
        price: 850,
        sellerId: sellers[0].id,
        description: 'AC bus ticket from Dhaka to Chittagong. Non-stop service.',
      },
      {
        transportType: 'bus',
        transportCompany: 'Green Line',
        routeFrom: 'Dhaka',
        routeTo: "Cox's Bazar",
        departureDate: '2025-03-29',
        departureTime: '21:00',
        seatNumber: 'B3',
        seatType: 'AC',
        coachNumber: 'GL-2048',
        ticketType: 'online_copy',
        price: 1200,
        originalPrice: 1500,
        sellerId: sellers[0].id,
        description: 'Green Line AC Volvo ticket. Direct to Cox\'s Bazar.',
      },
      {
        transportType: 'bus',
        transportCompany: 'Shohagh Paribahan',
        routeFrom: 'Dhaka',
        routeTo: 'Sylhet',
        departureDate: '2025-03-30',
        departureTime: '23:00',
        seatNumber: 'C5',
        seatType: 'Non-AC',
        coachNumber: 'SP-3012',
        ticketType: 'counter_copy',
        price: 550,
        originalPrice: 700,
        sellerId: sellers[1].id,
        description: 'Non-AC bus ticket to Sylhet. Counter copy available.',
      },
      // Train tickets
      {
        transportType: 'train',
        transportCompany: 'Bangladesh Railway',
        routeFrom: 'Dhaka',
        routeTo: 'Chittagong',
        departureDate: '2025-03-28',
        departureTime: '06:00',
        seatNumber: 'S-12',
        seatType: 'Snigdha',
        coachNumber: 'CHA-3',
        ticketType: 'online_copy',
        price: 685,
        sellerId: sellers[0].id,
        description: 'Suborno Express Snigdha class ticket. Morning departure.',
      },
      {
        transportType: 'train',
        transportCompany: 'Bangladesh Railway',
        routeFrom: 'Dhaka',
        routeTo: 'Rajshahi',
        departureDate: '2025-03-29',
        departureTime: '08:00',
        seatNumber: 'K-24',
        seatType: 'Shovan',
        coachNumber: 'SH-5',
        ticketType: 'online_copy',
        price: 450,
        sellerId: sellers[1].id,
        description: 'Silk City Express Shovan class ticket.',
      },
      {
        transportType: 'train',
        transportCompany: 'Bangladesh Railway',
        routeFrom: 'Dhaka',
        routeTo: 'Sylhet',
        departureDate: '2025-03-30',
        departureTime: '07:30',
        seatNumber: 'A-8',
        seatType: 'AC_B',
        coachNumber: 'ACB-2',
        ticketType: 'counter_copy',
        price: 900,
        sellerId: sellers[2].id,
        description: 'Parabat Express AC berth ticket. Morning train.',
      },
      // Flight tickets
      {
        transportType: 'flight',
        transportCompany: 'Biman Bangladesh Airlines',
        routeFrom: 'Dhaka',
        routeTo: "Cox's Bazar",
        departureDate: '2025-03-28',
        departureTime: '10:00',
        seatNumber: '12A',
        seatType: 'Economy',
        coachNumber: 'BG-401',
        ticketType: 'online_copy',
        price: 4500,
        originalPrice: 5500,
        sellerId: sellers[2].id,
        description: 'Biman Bangladesh direct flight to Cox\'s Bazar. Morning flight.',
      },
      {
        transportType: 'flight',
        transportCompany: 'US-Bangla Airlines',
        routeFrom: 'Dhaka',
        routeTo: 'Chittagong',
        departureDate: '2025-03-29',
        departureTime: '14:30',
        seatNumber: '7F',
        seatType: 'Economy',
        coachNumber: 'UB-503',
        ticketType: 'online_copy',
        price: 3500,
        originalPrice: 4000,
        sellerId: sellers[1].id,
        description: 'US-Bangla afternoon flight to Chittagong.',
      },
      {
        transportType: 'flight',
        transportCompany: 'Novoair',
        routeFrom: 'Dhaka',
        routeTo: 'Sylhet',
        departureDate: '2025-03-30',
        departureTime: '16:00',
        seatNumber: '3C',
        seatType: 'Economy',
        coachNumber: 'VQ-107',
        ticketType: 'counter_copy',
        price: 3200,
        sellerId: sellers[2].id,
        description: 'Novoair afternoon flight to Sylhet.',
      },
      // Launch tickets
      {
        transportType: 'launch',
        transportCompany: 'Bangladesh Shipping Corporation',
        routeFrom: 'Dhaka',
        routeTo: 'Barishal',
        departureDate: '2025-03-28',
        departureTime: '18:00',
        seatNumber: 'Cabin-5',
        seatType: 'Cabin',
        coachNumber: 'DECK-2',
        ticketType: 'counter_copy',
        price: 1200,
        sellerId: sellers[0].id,
        description: 'Overnight launch cabin ticket to Barishal. Comfortable journey.',
      },
      {
        transportType: 'launch',
        transportCompany: 'Sundarban Launch Service',
        routeFrom: 'Dhaka',
        routeTo: 'Khulna',
        departureDate: '2025-03-29',
        departureTime: '17:00',
        seatNumber: 'Cabin-12',
        seatType: 'Cabin',
        coachNumber: 'DECK-1',
        ticketType: 'online_copy',
        price: 1400,
        originalPrice: 1800,
        sellerId: sellers[1].id,
        description: 'Sundarban Launch first class cabin. Evening departure.',
      },
      {
        transportType: 'launch',
        transportCompany: 'Bangladesh Shipping Corporation',
        routeFrom: 'Dhaka',
        routeTo: 'Barishal',
        departureDate: '2025-03-30',
        departureTime: '19:00',
        seatNumber: 'Seat-28',
        seatType: 'Chair',
        coachNumber: 'DECK-3',
        ticketType: 'counter_copy',
        price: 650,
        sellerId: sellers[2].id,
        description: 'Launch chair ticket to Barishal. Budget friendly.',
      },
    ];

    let ticketCounter = await db.counter.findUnique({ where: { name: 'ticket_counter' } });
    if (!ticketCounter) {
      ticketCounter = await db.counter.create({
        data: { name: 'ticket_counter', value: 0 },
      });
    }

    for (const td of ticketData) {
      ticketCounter = await db.counter.update({
        where: { name: 'ticket_counter' },
        data: { value: { increment: 1 } },
      });

      const ticketId = `ETR-${String(ticketCounter.value).padStart(8, '0')}`;
      const platformFee = Math.max(20, Math.round(td.price * 0.02));

      await db.ticket.create({
        data: {
          ticketId,
          sellerId: td.sellerId,
          transportType: td.transportType,
          transportCompany: td.transportCompany,
          ticketType: td.ticketType,
          pnrNumber: td.ticketType === 'online_copy' ? `PNR-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : null,
          ticketDocument: td.ticketType === 'online_copy' ? '/uploads/sample-ticket.pdf' : '/uploads/sample-ticket.jpg',
          routeFrom: td.routeFrom,
          routeTo: td.routeTo,
          departureDate: td.departureDate,
          departureTime: td.departureTime,
          boardingPoint: td.routeFrom + ' Station',
          droppingPoint: td.routeTo + ' Station',
          seatClass: td.transportType === 'bus' ? (td.seatType === 'AC' ? 'ac_business' : 'non_ac') : null,
          seatNumber: td.seatNumber,
          seatType: td.seatType,
          coachNumber: td.coachNumber,
          originalPrice: td.originalPrice || td.price,
          price: td.price,
          platformFee,
          totalAmount: td.price + platformFee,
          deliveryType: td.ticketType === 'counter_copy' ? 'in_person' : null,
          meetingPlace: td.ticketType === 'counter_copy' ? td.routeTo + ' Bus Terminal' : null,
          description: td.description,
          isConfirmed: true,
          status: 'active',
          isFeatured: td.price >= 3000,
        },
      });
    }

    // 6. Create settings
    const settings = [
      { key: 'platform_fee_percentage', value: '2', group: 'fees' },
      { key: 'platform_fee_minimum', value: '20', group: 'fees' },
      { key: 'min_withdrawal_amount', value: '100', group: 'wallet' },
      { key: 'max_withdrawal_amount', value: '50000', group: 'wallet' },
      { key: 'escrow_hold_days', value: '3', group: 'escrow' },
      { key: 'auto_release_days', value: '7', group: 'escrow' },
      { key: 'site_name', value: 'Eid Ticket Resell', group: 'general' },
      { key: 'site_description', value: 'A secure marketplace for buying and selling transport tickets in Bangladesh', group: 'general' },
      { key: 'contact_email', value: 'support@eidticketresell.com', group: 'general' },
      { key: 'contact_phone', value: '+8801700000000', group: 'general' },
      { key: 'bkash_number', value: '+8801700000000', group: 'payment' },
      { key: 'bank_name', value: 'Dutch Bangla Bank', group: 'payment' },
      { key: 'bank_account_name', value: 'Eid Ticket Resell Ltd', group: 'payment' },
      { key: 'bank_account_number', value: '1234567890', group: 'payment' },
    ];

    for (const setting of settings) {
      await db.setting.create({ data: setting });
    }

    // 7. Create welcome notification for admin
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'Welcome Admin!',
        message: 'The system has been seeded with sample data. You can manage everything from the admin panel.',
        type: 'info',
      },
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        admin: { email: 'admin@eidticket.com', password: 'admin123' },
        users: regularUsers.map((u, i) => ({ email: `user${i + 1}@example.com`, password: 'user1234' })),
        sellers: sellers.map((s, i) => ({ email: `seller${i + 1}@example.com`, password: 'seller123' })),
        ticketsCreated: ticketData.length,
        transportCompaniesCreated: companies.length,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error during seeding' },
      { status: 500 }
    );
  }
}
