import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSmsServiceFromDb } from '@/lib/sms';

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

    const smsService = await getSmsServiceFromDb();
    const result = await smsService.getBalance();

    return NextResponse.json({
      provider: smsService.provider,
      balance: result.balance,
      error: result.error,
    });
  } catch (error) {
    console.error('SMS balance check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
