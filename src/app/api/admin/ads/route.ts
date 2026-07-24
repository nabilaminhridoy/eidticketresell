import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Authorization token required' }, { status: 401 }) };
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return { payload };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

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

// POST: Create new ad
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { title, description, image, link, placement, type, startDate, endDate } = body;

    if (!title || !placement) {
      return NextResponse.json({ error: 'title and placement are required' }, { status: 400 });
    }

    const ad = await db.ad.create({
      data: {
        title,
        description: description || null,
        image: image || null,
        link: link || null,
        placement,
        type: type || 'banner',
        isActive: true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({
      ad: {
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
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin ad error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete ad by id
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    await db.ad.delete({ where: { id } });

    return NextResponse.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete admin ad error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
