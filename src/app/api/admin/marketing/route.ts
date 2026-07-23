import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch coupons/promo codes
    const coupons = await db.coupon.findMany({
      include: { usages: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const promoRecords = coupons.map(c => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      minAmount: c.minAmount,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      validFrom: c.validFrom.toISOString(),
      validUntil: c.validUntil.toISOString(),
      isActive: c.isActive,
      status: c.isActive && new Date(c.validUntil) > new Date() ? 'active' : 'expired',
    }));

    // Fetch referrals
    const referrals = await db.referral.findMany({
      include: {
        referrer: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      promos: promoRecords,
      referrals,
    });
  } catch (error) {
    console.error('Get admin marketing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
