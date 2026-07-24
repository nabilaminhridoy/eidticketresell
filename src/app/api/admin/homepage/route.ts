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

    const sections = await db.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      sections: sections.map(s => ({
        id: s.id,
        sectionKey: s.sectionKey,
        title: s.title,
        titleBn: s.titleBn || '',
        subtitle: s.subtitle || '',
        subtitleBn: s.subtitleBn || '',
        content: s.content || '',
        contentBn: s.contentBn || '',
        isVisible: s.isVisible,
        order: s.order,
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get admin homepage error:', error);
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
    const { sectionKey, title, titleBn, subtitle, subtitleBn, content, contentBn, isVisible } = body as {
      sectionKey: string;
      title?: string;
      titleBn?: string;
      subtitle?: string;
      subtitleBn?: string;
      content?: string;
      contentBn?: string;
      isVisible?: boolean;
    };

    if (!sectionKey) {
      return NextResponse.json({ error: 'sectionKey is required' }, { status: 400 });
    }

    const section = await db.homepageSection.upsert({
      where: { sectionKey },
      update: {
        title: title || '',
        titleBn: titleBn || null,
        subtitle: subtitle || null,
        subtitleBn: subtitleBn || null,
        content: content || null,
        contentBn: contentBn || null,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
      create: {
        sectionKey,
        title: title || '',
        titleBn: titleBn || null,
        subtitle: subtitle || null,
        subtitleBn: subtitleBn || null,
        content: content || null,
        contentBn: contentBn || null,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({
      success: true,
      section: {
        id: section.id,
        sectionKey: section.sectionKey,
        title: section.title,
        titleBn: section.titleBn || '',
        subtitle: section.subtitle || '',
        subtitleBn: section.subtitleBn || '',
        content: section.content || '',
        contentBn: section.contentBn || '',
        isVisible: section.isVisible,
        order: section.order,
      },
    });
  } catch (error) {
    console.error('Update admin homepage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
