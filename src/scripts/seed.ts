#!/usr/bin/env bun
/**
 * Standalone seed script for populating the database with prefixed IDs.
 * Run with: bun run src/scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

async function generatePrefixedId(prefix: string): Promise<string> {
  const counterName = `${prefix.toLowerCase()}_seq`;
  const counter = await db.counter.upsert({
    where: { name: counterName },
    update: { value: { increment: 1 } },
    create: { name: counterName, value: 1 },
  });
  return `${prefix}-${counter.value}`;
}

async function main() {
  console.log('🧹 Cleaning database...');

  // Delete in dependency order
  await db.message.deleteMany();
  await db.chatParticipant.deleteMany();
  await db.chat.deleteMany();
  await db.journeyVerification.deleteMany();
  await db.refund.deleteMany();
  await db.dispute.deleteMany();
  await db.review.deleteMany();
  await db.supportReply.deleteMany();
  await db.supportTicket.deleteMany();
  await db.notification.deleteMany();
  await db.adminActivityLog.deleteMany();
  await db.activityLog.deleteMany();
  await db.transaction.deleteMany();
  await db.withdrawal.deleteMany();
  await db.couponUsage.deleteMany();
  await db.coupon.deleteMany();
  await db.order.deleteMany();
  await db.ticket.deleteMany();
  await db.kyc.deleteMany();
  await db.wallet.deleteMany();
  await db.referral.deleteMany();
  await db.otpVerification.deleteMany();
  await db.user.deleteMany();
  await db.blogPost.deleteMany();
  await db.blogTag.deleteMany();
  await db.blogCategory.deleteMany();
  await db.faqCategory.deleteMany();
  await db.ad.deleteMany();
  await db.setting.deleteMany();
  await db.transportCompany.deleteMany();
  await db.counter.deleteMany();
  await db.admin.deleteMany();

  console.log('✅ Database cleaned');

  // 1. ADMINS
  console.log('1️⃣ Creating admins...');
  const hashedPassword = await hash('admin123', 10);
  const admin1 = await db.admin.create({ data: { email: 'admin@eidticketresell.com', name: 'Super Admin', password: hashedPassword, role: 'super_admin', isActive: true } });
  const admin2 = await db.admin.create({ data: { email: 'moderator@eidticketresell.com', name: 'Moderator Admin', password: hashedPassword, role: 'admin', isActive: true } });
  const admin3 = await db.admin.create({ data: { email: 'support@eidticketresell.com', name: 'Support Staff', password: hashedPassword, role: 'admin', isActive: true } });

  // 2. SETTINGS
  console.log('2️⃣ Creating settings...');
  const settingsData = [
    { key: 'site_name', value: 'Eid Ticket Resell', group: 'general' },
    { key: 'site_description', value: 'Bangladesh\'s trusted platform for reselling tickets.', group: 'general' },
    { key: 'platform_fee_online', value: '2', group: 'fees' },
    { key: 'platform_fee_counter', value: '3', group: 'fees' },
    { key: 'bkash_merchant_number', value: '+8801700000000', group: 'payment' },
    { key: 'withdrawal_min_amount', value: '500', group: 'payment' },
    { key: 'escrow_hold_hours', value: '48', group: 'system' },
    { key: 'maintenance_mode', value: 'false', group: 'system' },
  ];
  for (const s of settingsData) await db.setting.create({ data: s });

  // 3. TRANSPORT COMPANIES
  console.log('3️⃣ Creating transport companies...');
  const tcData = [
    { name: 'Green Line Paribahan', nameBn: 'গ্রিন লাইন পরিবহন', type: 'bus', isActive: true },
    { name: 'Shyamoli Paribahan', nameBn: 'শ্যামলী পরিবহন', type: 'bus', isActive: true },
    { name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রিজ', type: 'bus', isActive: true },
    { name: 'Desh Travels', nameBn: 'দেশ ট্রাভেলস', type: 'bus', isActive: true },
    { name: 'Bangladesh Railway', nameBn: 'বাংলাদেশ রেলওয়ে', type: 'train', isActive: true },
    { name: 'Biman Bangladesh Airlines', nameBn: 'বিমান বাংলাদেশ এয়ারলাইন্স', type: 'flight', isActive: true },
    { name: 'US-Bangla Airlines', nameBn: 'US-বাংলা এয়ারলাইন্স', type: 'flight', isActive: true },
    { name: 'Novoair', nameBn: 'নভোএয়ার', type: 'flight', isActive: true },
    { name: 'BIWTC Launch Service', nameBn: 'বিআইডব্লিউটিসি লঞ্চ সার্ভিস', type: 'launch', isActive: true },
    { name: 'Sadharan Bima Launch', nameBn: 'সাধারণ বিমা লঞ্চ', type: 'launch', isActive: true },
  ];
  for (const tc of tcData) await db.transportCompany.create({ data: tc });

  // 4. USERS
  console.log('4️⃣ Creating users...');
  const userPassword = await hash('user123', 10);
  const sellers = [];
  const buyers = [];

  const sellerData = [
    { email: 'karim@example.com', phone: '+8801711111111', username: 'karim_seller', name: 'Karim Uddin', password: userPassword, role: 'verified_seller', isKycVerified: true, emailVerified: true, phoneVerified: true },
    { email: 'rahim@example.com', phone: '+8801722222222', username: 'rahim_seller', name: 'Rahim Khan', password: userPassword, role: 'verified_seller', isKycVerified: true, emailVerified: true, phoneVerified: true },
    { email: 'zahid@example.com', phone: '+8801733333333', username: 'zahid_seller', name: 'Zahid Hassan', password: userPassword, role: 'verified_seller', isKycVerified: true, emailVerified: true, phoneVerified: true },
    { email: 'tanvir@example.com', phone: '+8801744444444', username: 'tanvir_seller', name: 'Tanvir Ahmed', password: userPassword, role: 'verified_seller', isKycVerified: true, emailVerified: true, phoneVerified: true },
    { email: 'aminul@example.com', phone: '+8801755555555', username: 'aminul_seller', name: 'Aminul Islam', password: userPassword, role: 'verified_seller', isKycVerified: true, emailVerified: true, phoneVerified: true },
  ];
  for (const ud of sellerData) sellers.push(await db.user.create({ data: ud }));

  const buyerData = [
    { email: 'fatima@example.com', phone: '+8801766666666', username: 'fatima_buyer', name: 'Fatima Begum', password: userPassword, role: 'user', emailVerified: true, phoneVerified: true },
    { email: 'nusrat@example.com', phone: '+8801777777777', username: 'nusrat_buyer', name: 'Nusrat Jahan', password: userPassword, role: 'user', emailVerified: true },
    { email: 'sabrina@example.com', phone: '+8801788888888', username: 'sabrina_buyer', name: 'Sabrina Chowdhury', password: userPassword, role: 'user', emailVerified: true },
    { email: 'rumi@example.com', phone: '+8801799999999', username: 'rumi_buyer', name: 'Rumi Akter', password: userPassword, role: 'user', emailVerified: true, phoneVerified: true },
    { email: 'imran@example.com', username: 'imran_buyer', name: 'Imran Hossain', password: userPassword, role: 'user' },
    { email: 'salma@example.com', phone: '+8801712121212', username: 'salma_buyer', name: 'Salma Khatun', password: userPassword, role: 'user', emailVerified: true },
    { email: 'arif@example.com', phone: '+8801713131313', username: 'arif_buyer', name: 'Arif Rahman', password: userPassword, role: 'user', emailVerified: true },
  ];
  for (const bd of buyerData) buyers.push(await db.user.create({ data: bd }));

  // 5. KYC
  console.log('5️⃣ Creating KYC records...');
  const kycRecords = [];
  const kycData = [
    { userId: sellers[0].id, kycName: 'Karim Uddin', kycDob: '1985-03-15', kycGender: 'male', documentType: 'nid', documentNumber: 'NID-1985-12345', documentFront: '/uploads/kyc/karim-front.jpg', selfiePhoto: '/uploads/kyc/karim-selfie.jpg', status: 'approved', district: 'Dhaka', division: 'Dhaka' },
    { userId: sellers[1].id, kycName: 'Rahim Khan', kycDob: '1990-07-22', kycGender: 'male', documentType: 'nid', documentNumber: 'NID-1990-67890', documentFront: '/uploads/kyc/rahim-front.jpg', selfiePhoto: '/uploads/kyc/rahim-selfie.jpg', status: 'approved', district: 'Chittagong', division: 'Chittagong' },
    { userId: sellers[2].id, kycName: 'Zahid Hassan', kycDob: '1988-01-10', kycGender: 'male', documentType: 'nid', documentNumber: 'NID-1988-11111', documentFront: '/uploads/kyc/zahid-front.jpg', selfiePhoto: '/uploads/kyc/zahid-selfie.jpg', status: 'approved', district: 'Sylhet', division: 'Sylhet' },
    { userId: sellers[3].id, kycName: 'Tanvir Ahmed', kycDob: '1992-11-28', kycGender: 'male', documentType: 'driving_licence', documentNumber: 'DL-1992-22222', documentFront: '/uploads/kyc/tanvir-front.jpg', selfiePhoto: '/uploads/kyc/tanvir-selfie.jpg', status: 'approved', district: 'Rajshahi', division: 'Rajshahi' },
    { userId: sellers[4].id, kycName: 'Aminul Islam', kycDob: '1987-05-14', kycGender: 'male', documentType: 'nid', documentNumber: 'NID-1987-33333', documentFront: '/uploads/kyc/aminul-front.jpg', selfiePhoto: '/uploads/kyc/aminul-selfie.jpg', status: 'approved', district: 'Khulna', division: 'Khulna' },
    { userId: buyers[0].id, kycName: 'Fatima Begum', kycDob: '1995-09-03', kycGender: 'female', documentType: 'nid', documentNumber: 'NID-1995-44444', documentFront: '/uploads/kyc/fatima-front.jpg', selfiePhoto: '/uploads/kyc/fatima-selfie.jpg', status: 'pending' },
    { userId: buyers[3].id, kycName: 'Rumi Akter', kycDob: '1993-06-25', kycGender: 'female', documentType: 'nid', documentNumber: 'NID-1993-55555', documentFront: '/uploads/kyc/rumi-front.jpg', selfiePhoto: '/uploads/kyc/rumi-selfie.jpg', status: 'pending' },
    { userId: buyers[5].id, kycName: 'Imran Hossain', kycDob: '1997-08-09', kycGender: 'male', documentType: 'passport', documentNumber: 'PP-1997-66666', documentFront: '/uploads/kyc/imran-front.jpg', selfiePhoto: '/uploads/kyc/imran-selfie.jpg', status: 'rejected', reviewNote: 'Document image not clear. Please resubmit.' },
  ];
  for (const kd of kycData) {
    const kycId = await generatePrefixedId('KYC');
    kycRecords.push(await db.kyc.create({ data: { kycId, ...kd } }));
  }

  // 6. WALLETS
  console.log('6️⃣ Creating wallets...');
  const walletData = [
    ...sellers.map((s, i) => ({ userId: s.id, availableBalance: 25000 - i * 2000, pendingBalance: 0, escrowBalance: 1000 + i * 500, totalEarnings: 15000 + i * 3000, totalWithdrawn: 5000 + i * 1000 })),
    ...buyers.map((b, i) => ({ userId: b.id, availableBalance: 3000 - i * 200, pendingBalance: 0, escrowBalance: 0, totalEarnings: 0, totalWithdrawn: 0 })),
  ];
  const wallets = [];
  for (const wd of walletData) wallets.push(await db.wallet.create({ data: wd }));

  // 7. TICKETS
  console.log('7️⃣ Creating tickets...');
  const tickets = [];
  const ticketDataList = [
    { sellerId: sellers[0].id, transportType: 'bus', transportCompany: 'Green Line Paribahan', ticketType: 'online_copy', pnrNumber: 'GL-2025-001', routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-06-15', departureTime: '06:00 AM', seatClass: 'AC Business', price: 1350, platformFee: 27, totalAmount: 1377, status: 'sold' },
    { sellerId: sellers[1].id, transportType: 'bus', transportCompany: 'Shyamoli Paribahan', ticketType: 'online_copy', pnrNumber: 'SP-2025-001', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-06-20', departureTime: '08:00 AM', seatClass: 'Non AC', price: 550, platformFee: 11, totalAmount: 561, status: 'sold' },
    { sellerId: sellers[2].id, transportType: 'bus', transportCompany: 'Hanif Enterprise', ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: "Cox's Bazar", departureDate: '2025-06-25', departureTime: '09:00 PM', seatClass: 'AC Sleeper', price: 1200, platformFee: 36, totalAmount: 1236, status: 'active', deliveryType: 'in_person', meetingPlace: 'Gabtoli Bus Terminal' },
    { sellerId: sellers[3].id, transportType: 'bus', transportCompany: 'Desh Travels', ticketType: 'counter_copy', routeFrom: 'Chittagong', routeTo: 'Dhaka', departureDate: '2025-06-28', departureTime: '10:00 PM', seatClass: 'AC Business', price: 850, platformFee: 25.5, totalAmount: 875.5, status: 'active', deliveryType: 'courier', courierName: 'Pathao', deliverySpeed: 'express', deliveryCharge: 120, deliveryChargePaidBy: 'buyer' },
    { sellerId: sellers[0].id, transportType: 'train', transportCompany: 'Bangladesh Railway', ticketType: 'online_copy', pnrNumber: 'BR-2025-001', routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-06-30', departureTime: '07:00 AM', seatClass: 'AC Snigdha', price: 1100, platformFee: 22, totalAmount: 1122, status: 'sold' },
    { sellerId: sellers[4].id, transportType: 'train', transportCompany: 'Bangladesh Railway', ticketType: 'online_copy', pnrNumber: 'BR-2025-002', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-07-02', departureTime: '08:30 AM', seatClass: 'AC Snigdha', price: 700, platformFee: 14, totalAmount: 714, status: 'active' },
    { sellerId: sellers[1].id, transportType: 'train', transportCompany: 'Bangladesh Railway', ticketType: 'online_copy', pnrNumber: 'BR-2025-003', routeFrom: 'Dhaka', routeTo: 'Rajshahi', departureDate: '2025-07-05', departureTime: '09:00 AM', seatClass: 'AC Snigdha', price: 650, platformFee: 13, totalAmount: 663, status: 'pending_review' },
    { sellerId: sellers[2].id, transportType: 'flight', transportCompany: 'US-Bangla Airlines', ticketType: 'online_copy', pnrNumber: 'USB-2025-001', routeFrom: 'Dhaka', routeTo: "Cox's Bazar", departureDate: '2025-06-22', departureTime: '11:00 AM', seatClass: 'Economy', price: 3500, platformFee: 70, totalAmount: 3570, status: 'sold' },
    { sellerId: sellers[4].id, transportType: 'flight', transportCompany: 'Biman Bangladesh Airlines', ticketType: 'online_copy', pnrNumber: 'BIM-2025-001', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-07-10', departureTime: '02:00 PM', seatClass: 'Economy', price: 2800, platformFee: 56, totalAmount: 2856, status: 'active' },
    { sellerId: sellers[3].id, transportType: 'flight', transportCompany: 'Novoair', ticketType: 'online_copy', pnrNumber: 'NOV-2025-001', routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-07-12', departureTime: '04:00 PM', seatClass: 'Economy', price: 2500, platformFee: 50, totalAmount: 2550, status: 'active' },
    { sellerId: sellers[0].id, transportType: 'launch', transportCompany: 'BIWTC Launch Service', ticketType: 'counter_copy', routeFrom: 'Dhaka', routeTo: 'Barisal', departureDate: '2025-06-27', departureTime: '06:00 PM', seatClass: 'AC Double Decker', price: 800, platformFee: 24, totalAmount: 824, status: 'active', deliveryType: 'in_person', meetingPlace: 'Sadarghat Launch Terminal' },
    { sellerId: sellers[4].id, transportType: 'launch', transportCompany: 'Sadharan Bima Launch', ticketType: 'counter_copy', routeFrom: 'Barisal', routeTo: 'Dhaka', departureDate: '2025-07-01', departureTime: '08:00 PM', seatClass: 'AC Suite Class Sleeper', price: 1500, platformFee: 45, totalAmount: 1545, status: 'cancelled', deliveryType: 'courier', courierName: 'Steadfast', deliveryCharge: 60, deliveryChargePaidBy: 'seller' },
  ];
  for (const td of ticketDataList) {
    const ticketId = await generatePrefixedId('ETR');
    tickets.push(await db.ticket.create({ data: { ticketId, ...td, originalPrice: td.price } }));
  }

  // 8. ORDERS
  console.log('8️⃣ Creating orders...');
  const orders = [];
  const orderDataList = [
    { ticketId: tickets[0].id, buyerId: buyers[0].id, sellerId: sellers[0].id, amount: 1350, platformFee: 27, totalAmount: 1377, escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'online_pdf', deliveryStatus: 'confirmed', status: 'completed', completedAt: new Date('2025-06-15T12:00:00') },
    { ticketId: tickets[1].id, buyerId: buyers[3].id, sellerId: sellers[1].id, amount: 550, platformFee: 11, totalAmount: 561, escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'online_pdf', deliveryStatus: 'confirmed', status: 'completed', completedAt: new Date('2025-06-20T12:00:00') },
    { ticketId: tickets[4].id, buyerId: buyers[0].id, sellerId: sellers[0].id, amount: 1100, platformFee: 22, totalAmount: 1122, escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'online_pdf', deliveryStatus: 'pending', status: 'confirmed' },
    { ticketId: tickets[5].id, buyerId: buyers[5].id, sellerId: sellers[4].id, amount: 700, platformFee: 14, totalAmount: 714, escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'online_pdf', deliveryStatus: 'pending', status: 'in_progress' },
    { ticketId: tickets[7].id, buyerId: buyers[2].id, sellerId: sellers[2].id, amount: 3500, platformFee: 70, totalAmount: 3570, escrowStatus: 'released', paymentStatus: 'paid', deliveryMethod: 'online_pdf', deliveryStatus: 'confirmed', status: 'completed', completedAt: new Date('2025-06-22T14:00:00') },
    { ticketId: tickets[3].id, buyerId: buyers[4].id, sellerId: sellers[3].id, amount: 850, platformFee: 25.5, totalAmount: 875.5, escrowStatus: 'refunded', paymentStatus: 'refunded', deliveryMethod: 'in_person', deliveryStatus: 'pending', status: 'cancelled', cancelledAt: new Date('2025-06-28') },
    { ticketId: tickets[10].id, buyerId: buyers[6].id, sellerId: sellers[0].id, amount: 800, platformFee: 24, totalAmount: 824, escrowStatus: 'held', paymentStatus: 'paid', deliveryMethod: 'in_person', deliveryStatus: 'pending', status: 'in_progress' },
    { ticketId: tickets[6].id, buyerId: buyers[1].id, sellerId: sellers[1].id, amount: 650, platformFee: 13, totalAmount: 663, escrowStatus: 'held', paymentStatus: 'pending', deliveryMethod: 'online_pdf', deliveryStatus: 'pending', status: 'pending' },
  ];
  for (const od of orderDataList) {
    const orderId = await generatePrefixedId('ORD');
    orders.push(await db.order.create({ data: { orderId, ...od } }));
  }

  // 9. TRANSACTIONS
  console.log('9️⃣ Creating transactions...');
  const sellerWalletIds = sellers.map(s => wallets.find(w => w.userId === s.id)?.id || '');
  const buyerWalletIds = buyers.map(b => wallets.find(w => w.userId === b.id)?.id || '');

  const transactionDataList = [
    { walletId: sellerWalletIds[0], type: 'credit', amount: 1350, balance: 25000, description: 'Payment received for ETR-1', orderId: orders[0].id },
    { walletId: sellerWalletIds[1], type: 'credit', amount: 550, balance: 23000, description: 'Payment received for ETR-2', orderId: orders[1].id },
    { walletId: sellerWalletIds[2], type: 'credit', amount: 3500, balance: 21000, description: 'Payment received for ETR-8', orderId: orders[4].id },
    { walletId: sellerWalletIds[0], type: 'escrow_hold', amount: 1100, balance: 23900, description: 'Escrow held for ETR-5', orderId: orders[2].id },
    { walletId: sellerWalletIds[4], type: 'escrow_hold', amount: 700, balance: 13000, description: 'Escrow held for ETR-6', orderId: orders[3].id },
    { walletId: sellerWalletIds[0], type: 'escrow_hold', amount: 800, balance: 23100, description: 'Escrow held for ETR-11', orderId: orders[6].id },
    { walletId: sellerWalletIds[0], type: 'escrow_release', amount: 1350, balance: 24450, description: 'Escrow released for ORD-1', orderId: orders[0].id },
    { walletId: sellerWalletIds[1], type: 'escrow_release', amount: 550, balance: 22450, description: 'Escrow released for ORD-2', orderId: orders[1].id },
    { walletId: buyerWalletIds[0], type: 'debit', amount: 1377, balance: 1623, description: 'Payment for ETR-1', orderId: orders[0].id },
    { walletId: buyerWalletIds[3], type: 'debit', amount: 1122, balance: 1878, description: 'Payment for ETR-5', orderId: orders[2].id },
    { walletId: buyerWalletIds[2], type: 'debit', amount: 3570, balance: -570, description: 'Payment for ETR-8', orderId: orders[4].id },
    { walletId: buyerWalletIds[4], type: 'credit', amount: 875.5, balance: 1875.5, description: 'Refund for cancelled ORD-6', orderId: orders[5].id },
    { walletId: sellerWalletIds[3], type: 'escrow_refund', amount: 850, balance: 15000, description: 'Escrow refunded for ORD-6', orderId: orders[5].id },
    { walletId: buyerWalletIds[0], type: 'credit', amount: 2500, balance: 2500, description: 'Wallet top-up via bKash' },
    { walletId: buyerWalletIds[3], type: 'credit', amount: 3000, balance: 3000, description: 'Wallet top-up via bKash' },
  ];
  for (const td of transactionDataList) {
    const txnId = await generatePrefixedId('TXN');
    const wltId = await generatePrefixedId('WLT');
    await db.transaction.create({ data: { txnId, wltId, ...td } });
  }

  // 10. WITHDRAWALS
  console.log('🔟 Creating withdrawals...');
  const wdrDataList = [
    { walletId: sellerWalletIds[0], amount: 8000, method: 'bkash', accountDetails: '+8801711111111', status: 'completed' },
    { walletId: sellerWalletIds[1], amount: 5000, method: 'bkash', accountDetails: '+8801722222222', status: 'completed' },
    { walletId: sellerWalletIds[2], amount: 3000, method: 'bank_transfer', accountDetails: 'Dutch-Bangla Bank - 1234567890', status: 'pending' },
    { walletId: sellerWalletIds[3], amount: 2000, method: 'bkash', accountDetails: '+8801744444444', status: 'pending' },
    { walletId: sellerWalletIds[4], amount: 4000, method: 'bank_transfer', accountDetails: 'City Bank - 9876543210', status: 'rejected', reviewNote: 'Bank account verification failed.' },
  ];
  for (const wd of wdrDataList) {
    const wdrId = await generatePrefixedId('WDR');
    let payId: string | null = null;
    if (wd.status === 'completed') payId = await generatePrefixedId('PAY');
    await db.withdrawal.create({ data: { wdrId, payId, ...wd } });
  }

  // 11. DISPUTES
  console.log('1️⃣1️⃣ Creating disputes...');
  const dspDataList = [
    { orderId: orders[5].id, initiatedBy: 'buyer', reason: 'Seller did not deliver the ticket on time', description: 'Counter copy ticket was promised via courier but never arrived.', status: 'resolved', resolution: 'Full refund issued to buyer.', resolvedBy: admin1.id },
    { orderId: orders[6].id, initiatedBy: 'seller', reason: 'Buyer not showing up for in-person delivery', description: 'Buyer agreed to meet at Sadarghat terminal but did not show up.', status: 'investigating' },
  ];
  for (const dd of dspDataList) {
    const dspId = await generatePrefixedId('DSP');
    await db.dispute.create({ data: { dspId, ...dd } });
  }

  // 12. REFUNDS
  console.log('1️⃣2️⃣ Creating refunds...');
  const refDataList = [
    { orderId: orders[5].id, initiatedBy: 'buyer', reason: 'Ticket not delivered - courier failed', description: 'Counter copy ticket promised via Pathao courier but tracking was invalid.', amount: 875.5, status: 'completed', processedBy: admin1.id, processNote: 'Full refund processed.' },
    { orderId: orders[0].id, initiatedBy: 'admin', reason: 'Duplicate ticket detected', description: 'Admin detected this was a duplicate listing.', amount: 1377, status: 'rejected', processedBy: admin2.id, processNote: 'Investigation showed ticket was unique.' },
    { orderId: orders[6].id, initiatedBy: 'seller', reason: 'Buyer failed to appear for delivery', description: 'Buyer agreed to meet at terminal but did not show up.', amount: 824, status: 'pending' },
  ];
  for (const rd of refDataList) {
    const refId = await generatePrefixedId('REF');
    await db.refund.create({ data: { refId, ...rd } });
  }

  // 13. SUPPORT TICKETS
  console.log('1️⃣3️⃣ Creating support tickets...');
  const supDataList = [
    { userId: buyers[0].id, fullName: 'Fatima Begum', phone: '+8801766666666', email: 'fatima@example.com', subject: 'Cannot find my purchased ticket', message: 'I bought a ticket ETR-1 but cannot find it in my dashboard.', status: 'resolved', priority: 'medium' },
    { userId: null, fullName: 'Guest User', email: 'guest@example.com', subject: 'How to sell tickets?', message: 'I want to sell my bus ticket but I don\'t know the process.', status: 'open', priority: 'low' },
    { userId: sellers[2].id, fullName: 'Zahid Hassan', phone: '+8801733333333', email: 'zahid@example.com', subject: 'KYC verification delay', message: 'My KYC has been pending for 5 days.', status: 'in_progress', priority: 'high' },
    { userId: buyers[3].id, fullName: 'Rumi Akter', phone: '+8801799999999', email: 'rumi@example.com', subject: 'Payment not reflecting in wallet', message: 'I made a payment of ৳1122 but my wallet still shows old balance.', status: 'open', priority: 'urgent' },
    { userId: sellers[4].id, fullName: 'Aminul Islam', phone: '+8801755555555', email: 'aminul@example.com', subject: 'Withdrawal rejected', message: 'My withdrawal was rejected but the reason is unclear.', status: 'closed', priority: 'medium' },
  ];
  for (const sd of supDataList) {
    const supId = await generatePrefixedId('SUP');
    await db.supportTicket.create({ data: { supId, ...sd } });
  }

  // 14. REVIEWS
  console.log('1️⃣4️⃣ Creating reviews...');
  const reviewDataList = [
    { orderId: orders[0].id, authorId: buyers[0].id, targetId: sellers[0].id, rating: 5, comment: 'Great seller! Ticket was delivered instantly.' },
    { orderId: orders[1].id, authorId: buyers[3].id, targetId: sellers[1].id, rating: 4, comment: 'Good experience. Ticket received on time.' },
    { orderId: orders[4].id, authorId: buyers[2].id, targetId: sellers[2].id, rating: 3, comment: 'Flight ticket was overpriced but the process was smooth.' },
  ];
  for (const rd of reviewDataList) await db.review.create({ data: rd });

  // 15. CHATS & MESSAGES
  console.log('1️⃣5️⃣ Creating chats and messages...');
  for (const order of [orders[0], orders[2], orders[4], orders[6]]) {
    const chat = await db.chat.create({ data: { orderId: order.id } });
    await db.chatParticipant.createMany({ data: [
      { chatId: chat.id, userId: order.buyerId },
      { chatId: chat.id, userId: order.sellerId },
    ] });
    await db.message.createMany({ data: [
      { chatId: chat.id, senderId: order.buyerId, content: 'Hi! I\'m interested in this ticket. Is it still available?', isRead: true },
      { chatId: chat.id, senderId: order.sellerId, content: 'Yes, it\'s available!', isRead: true },
      { chatId: chat.id, senderId: order.buyerId, content: 'Great, I\'ll proceed.', isRead: false },
    ] });
  }

  // 16. JOURNEY VERIFICATIONS
  console.log('1️⃣6️⃣ Creating journey verifications...');
  await db.journeyVerification.create({ data: { orderId: orders[2].id, buyerId: buyers[0].id, status: 'submitted', photo: '/uploads/journey/jv-photo-1.jpg', gpsLat: 23.8103, gpsLng: 90.4125, submittedAt: new Date('2025-06-30T08:00:00') } });
  await db.journeyVerification.create({ data: { orderId: orders[6].id, buyerId: buyers[6].id, status: 'pending' } });

  // 17. NOTIFICATIONS
  console.log('1️⃣7️⃣ Creating notifications...');
  await db.notification.create({ data: { userId: sellers[0].id, title: 'KYC Approved!', message: 'Your KYC has been approved.', type: 'success' } });
  await db.notification.create({ data: { userId: buyers[0].id, title: 'Ticket Delivered', message: 'Your ticket ETR-1 has been delivered.', type: 'success' } });
  await db.notification.create({ data: { userId: sellers[2].id, title: 'New Order', message: 'You have a new order for your flight ticket.', type: 'info' } });

  // 18. ADS
  console.log('1️⃣8️⃣ Creating ads...');
  await db.ad.create({ data: { title: 'Eid Special - 10% Off All Bus Tickets', description: 'Limited time offer for Eid travel!', placement: 'homepage', type: 'banner', isActive: true, startDate: new Date('2025-06-01'), endDate: new Date('2025-07-15'), impressions: 15000, clicks: 450 } });
  await db.ad.create({ data: { title: 'Fly Safe with US-Bangla', description: 'Premium flight experience.', placement: 'sidebar', type: 'banner', isActive: true, impressions: 5000, clicks: 120 } });

  // 19. FAQ CATEGORIES
  console.log('1️⃣9️⃣ Creating FAQ categories...');
  await db.faqCategory.createMany({ data: [
    { name: 'General', slug: 'general', order: 1 },
    { name: 'Buying Tickets', slug: 'buying', order: 2 },
    { name: 'Selling Tickets', slug: 'selling', order: 3 },
    { name: 'Payments & Wallet', slug: 'payments', order: 4 },
    { name: 'Delivery', slug: 'delivery', order: 5 },
  ] });

  // 20. BLOG CATEGORIES & POSTS
  console.log('2️⃣0️⃣ Creating blog content...');
  const cat1 = await db.blogCategory.create({ data: { name: 'Travel Tips', slug: 'travel-tips' } });
  const cat2 = await db.blogCategory.create({ data: { name: 'Platform Updates', slug: 'platform-updates' } });
  await db.blogPost.create({ data: { title: '5 Tips for Safe Ticket Reselling', slug: '5-tips-safe-reselling', content: 'Always verify the ticket details before listing.', excerpt: 'Essential tips for safe ticket reselling.', categoryId: cat1.id, isPublished: true, publishedAt: new Date('2025-06-01'), author: 'Admin' } });
  await db.blogPost.create({ data: { title: 'New Feature: QR Code Delivery', slug: 'qr-code-delivery', content: 'We\'ve added QR code verification.', excerpt: 'Learn about QR code delivery.', categoryId: cat2.id, isPublished: true, publishedAt: new Date('2025-06-10'), author: 'Admin' } });

  console.log('\n✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('   Admins: 3');
  console.log(`   Users: ${sellers.length + buyers.length} (5 sellers + 7 buyers)`);
  console.log(`   KYC: ${kycRecords.length} (KYC-1 through KYC-8)`);
  console.log(`   Wallets: ${wallets.length}`);
  console.log(`   Tickets: ${tickets.length} (ETR-1 through ETR-12)`);
  console.log(`   Orders: ${orders.length} (ORD-1 through ORD-8)`);
  console.log(`   Transactions: 15 (TXN-1..15 / WLT-1..15)`);
  console.log(`   Withdrawals: 5 (WDR-1..5, PAY-1..2)`);
  console.log(`   Disputes: 2 (DSP-1..2)`);
  console.log(`   Refunds: 3 (REF-1..3)`);
  console.log(`   Support Tickets: 5 (SUP-1..5)`);
  console.log(`   Reviews: 3`);
  console.log(`   Chats: 4`);
  console.log(`   Journey Verifications: 2`);

  await db.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  });
