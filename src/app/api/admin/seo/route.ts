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

// GET: Return all SEO-related settings from Setting table (group: "seo")
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const seoSettings = await db.setting.findMany({
      where: { group: 'seo' },
    });

    const settingsFormatted = seoSettings.map(s => ({
      id: s.id,
      key: s.key,
      value: s.value,
      group: s.group,
    }));

    return NextResponse.json({ settings: settingsFormatted });
  } catch (error) {
    console.error('Get admin seo settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save SEO settings as key-value pairs in Setting table
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings array is required' }, { status: 400 });
    }

    const results = [];

    for (const setting of settings) {
      const { key, value } = setting;
      if (!key || !value) continue;

      // Upsert each setting: create if doesn't exist, update if it does
      const result = await db.setting.upsert({
        where: { key },
        update: { value, group: 'seo' },
        create: { key, value, group: 'seo' },
      });

      results.push({
        id: result.id,
        key: result.key,
        value: result.value,
        group: result.group,
      });
    }

    return NextResponse.json({ settings: results });
  } catch (error) {
    console.error('Save admin seo settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a specific SEO setting by key
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'key query parameter is required' }, { status: 400 });
    }

    const existing = await db.setting.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    await db.setting.delete({ where: { key } });

    return NextResponse.json({ message: 'SEO setting deleted successfully' });
  } catch (error) {
    console.error('Delete admin seo setting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
