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

// GET: Return all FAQ categories with their items
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const categories = await db.faqCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get admin faqs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create FAQ item
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { categoryId, question, questionBn, answer, answerBn, order, isActive } = body;

    if (!categoryId || !question || !answer) {
      return NextResponse.json({ error: 'categoryId, question, and answer are required' }, { status: 400 });
    }

    // Verify category exists
    const category = await db.faqCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'FAQ category not found' }, { status: 404 });
    }

    const item = await db.faqItem.create({
      data: {
        categoryId,
        question,
        questionBn: questionBn || null,
        answer,
        answerBn: answerBn || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create admin faq item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update FAQ item by id
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, question, questionBn, answer, answerBn, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    const updated = await db.faqItem.update({
      where: { id },
      data: {
        question: question ?? undefined,
        questionBn: questionBn ?? undefined,
        answer: answer ?? undefined,
        answerBn: answerBn ?? undefined,
        order: order ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error('Update admin faq item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete FAQ item by id
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const existing = await db.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    await db.faqItem.delete({ where: { id } });

    return NextResponse.json({ message: 'FAQ item deleted successfully' });
  } catch (error) {
    console.error('Delete admin faq item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
