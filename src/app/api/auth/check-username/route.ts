import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({
        available: false,
        message: 'Username must be 3-20 characters, lowercase letters/numbers/underscores, starting with a letter',
      }, { status: 200 });
    }

    const existing = await db.user.findUnique({ where: { username } });

    return NextResponse.json({
      available: !existing,
      message: existing ? 'Username is already taken' : 'Username is available',
    });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
