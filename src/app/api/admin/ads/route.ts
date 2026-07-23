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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [ads, total] = await Promise.all([
      db.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ad.count({ where }),
    ]);

    const adRecords = ads.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image: ad.image,
      link: ad.link,
      placement: ad.placement,
      type: ad.type,
      isActive: ad.isActive,
      status: ad.isActive ? 'active' : 'paused',
      startDate: ad.startDate?.toISOString() || null,
      endDate: ad.endDate?.toISOString() || null,
      impressions: ad.impressions,
      clicks: ad.clicks,
      createdAt: ad.createdAt.toISOString(),
      updatedAt: ad.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      ads: adRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin ads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
