import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Get all visible homepage sections ordered by order field (PUBLIC route - no auth required)
export async function GET() {
  try {
    const sections = await db.homepageSection.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });

    const sectionsFormatted = sections.map(s => ({
      id: s.id,
      sectionKey: s.sectionKey,
      title: s.title,
      titleBn: s.titleBn,
      subtitle: s.subtitle,
      subtitleBn: s.subtitleBn,
      content: s.content,
      contentBn: s.contentBn,
      order: s.order,
      updatedAt: s.updatedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ sections: sectionsFormatted });
  } catch (error) {
    console.error('Get homepage sections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
