import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { getSmsServiceFromDb } from '@/lib/sms';

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
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    const smsService = await getSmsServiceFromDb();
    const result = await smsService.send({ to, message });

    // Log the SMS attempt in activity log
    await db.adminActivityLog.create({
      data: {
        adminId: payload.id as string,
        action: result.success ? 'sms_sent' : 'sms_failed',
        details: `Test SMS to ${Array.isArray(to) ? to.join(',') : to}: ${result.success ? 'Success' : `Failed - ${result.error}`}`,
      },
    });

    return NextResponse.json({
      success: result.success,
      requestId: result.requestId,
      error: result.error,
      rawResponse: result.rawResponse,
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
