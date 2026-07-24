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

    const pages = await db.pageContent.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      pages: pages.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        titleBn: p.titleBn || '',
        content: p.content,
        contentBn: p.contentBn || '',
        isActive: p.isActive,
        updatedAt: p.updatedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get admin pages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { slug, title, titleBn, content, contentBn, isActive } = body as {
      slug: string;
      title: string;
      titleBn?: string;
      content: string;
      contentBn?: string;
      isActive?: boolean;
    };

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'slug, title, and content are required' }, { status: 400 });
    }

    const page = await db.pageContent.upsert({
      where: { slug },
      update: {
        title,
        titleBn: titleBn || null,
        content,
        contentBn: contentBn || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        slug,
        title,
        titleBn: titleBn || null,
        content,
        contentBn: contentBn || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        titleBn: page.titleBn || '',
        content: page.content,
        contentBn: page.contentBn || '',
        isActive: page.isActive,
        updatedAt: page.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create/update admin page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Page id is required' }, { status: 400 });
    }

    await db.pageContent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin page error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
