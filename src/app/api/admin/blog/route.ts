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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch blog posts
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      if (status === 'published') {
        where.isPublished = true;
      } else if (status === 'draft') {
        where.isPublished = false;
      }
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [posts, totalPosts] = await Promise.all([
      db.blogPost.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where }),
    ]);

    const postRecords = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      author: p.author,
      categoryId: p.categoryId,
      category: p.category?.name || '',
      status: p.isPublished ? 'published' : 'draft',
      publishedAt: p.publishedAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    // Fetch categories
    const categories = await db.blogCategory.findMany({
      include: { posts: { select: { id: true } } },
      orderBy: { name: 'asc' },
    });

    const categoryRecords = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.posts.length,
    }));

    // Fetch tags
    const tags = await db.blogTag.findMany({
      orderBy: { name: 'asc' },
    });

    const tagRecords = tags.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    }));

    return NextResponse.json({
      posts: postRecords,
      categories: categoryRecords,
      tags: tagRecords,
      pagination: { page, limit, total: totalPosts, totalPages: Math.ceil(totalPosts / limit) },
    });
  } catch (error) {
    console.error('Get admin blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
