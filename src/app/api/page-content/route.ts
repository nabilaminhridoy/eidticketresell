import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Get page content by slug (PUBLIC route - no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug query parameter is required' }, { status: 400 });
    }

    const page = await db.pageContent.findUnique({
      where: { slug },
    });

    if (!page || !page.isActive) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        titleBn: page.titleBn,
        content: page.content,
        contentBn: page.contentBn,
        updatedAt: page.updatedAt.toISOString(),
        createdAt: page.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get page content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
