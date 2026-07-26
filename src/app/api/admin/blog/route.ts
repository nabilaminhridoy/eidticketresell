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

function slugify(text: string): string {
  // Input length limited to 200 chars to prevent polynomial regex ReDoS
  const truncated = typeof text === 'string' && text.length > 200 ? text.slice(0, 200) : String(text);
  return truncated
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // nosem: js/regex/polynomial-redos
    .replace(/[\s_]+/g, '-') // nosem: js/regex/polynomial-redos
    .replace(/^-+|-+$/g, ''); // nosem: js/regex/polynomial-redos
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

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

// POST: Create blog post or category
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { action, title, content, excerpt, categoryId, author, status, categoryName, categorySlug } = body;

    // Create category
    if (action === 'create_category') {
      if (!categoryName) {
        return NextResponse.json({ error: 'categoryName is required' }, { status: 400 });
      }
      const slug = categorySlug || slugify(categoryName);
      const category = await db.blogCategory.create({
        data: { name: categoryName, slug },
      });
      return NextResponse.json({
        category: { id: category.id, name: category.name, slug: category.slug, count: 0 },
      }, { status: 201 });
    }

    // Create blog post
    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const slug = slugify(title);
    const isPublished = status === 'published';

    // Check slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'A post with this title/slug already exists' }, { status: 409 });
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        author: author || null,
        categoryId: categoryId || null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        author: post.author,
        categoryId: post.categoryId,
        category: post.category?.name || '',
        status: post.isPublished ? 'published' : 'draft',
        publishedAt: post.publishedAt?.toISOString() || null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update blog post
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, title, content, excerpt, categoryId, author, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isPublished = status === 'published';
    const shouldSetPublishedAt = isPublished && !existing.isPublished;

    const updated = await db.blogPost.update({
      where: { id },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
        excerpt: excerpt ?? undefined,
        author: author ?? undefined,
        categoryId: categoryId ?? undefined,
        isPublished: status ? isPublished : undefined,
        publishedAt: shouldSetPublishedAt ? new Date() : (status ? (isPublished ? existing.publishedAt : null) : undefined),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({
      post: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        content: updated.content,
        excerpt: updated.excerpt,
        coverImage: updated.coverImage,
        author: updated.author,
        categoryId: updated.categoryId,
        category: updated.category?.name || '',
        status: updated.isPublished ? 'published' : 'draft',
        publishedAt: updated.publishedAt?.toISOString() || null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update admin blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete blog post or category
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    // Delete category
    if (action === 'delete_category') {
      const category = await db.blogCategory.findUnique({ where: { id } });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      // Unlink posts from this category first
      await db.blogPost.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
      await db.blogCategory.delete({ where: { id } });
      return NextResponse.json({ message: 'Category deleted successfully' });
    }

    // Delete blog post
    const post = await db.blogPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete admin blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
