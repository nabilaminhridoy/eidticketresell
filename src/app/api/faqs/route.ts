import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Get all active FAQ categories with their active items (PUBLIC route - no auth required)
export async function GET() {
  try {
    const categories = await db.faqCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    const categoriesFormatted = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
      items: c.items.map(item => ({
        id: item.id,
        question: item.question,
        questionBn: item.questionBn,
        answer: item.answer,
        answerBn: item.answerBn,
        order: item.order,
      })),
    }));

    return NextResponse.json({ categories: categoriesFormatted });
  } catch (error) {
    console.error('Get public faqs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
