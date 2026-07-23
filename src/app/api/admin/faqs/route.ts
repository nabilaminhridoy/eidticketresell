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

    // Fetch FAQ categories
    const categories = await db.faqCategory.findMany({
      orderBy: { order: 'asc' },
    });

    const categoryRecords = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
      count: 0, // Will be populated when FAQ items are added
    }));

    return NextResponse.json({
      categories: categoryRecords,
    });
  } catch (error) {
    console.error('Get admin faqs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
