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
      where.OR = [
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { target: { name: { contains: search, mode: 'insensitive' } } },
        { comment: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, username: true } },
          target: { select: { id: true, name: true, username: true } },
          order: { select: { id: true, orderId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    const reviewRecords = reviews.map(r => ({
      id: r.id,
      orderId: r.order.orderId,
      authorId: r.authorId,
      authorName: r.author.name,
      targetId: r.targetId,
      targetName: r.target.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reviews: reviewRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
