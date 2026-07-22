import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { oneidService } from '@/lib/oneid';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = payload.id as string;

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check user has MFA enabled and has a bind_id
    if (!user.oneidMfaEnabled || !user.oneidBindId) {
      return NextResponse.json(
        { error: 'MFA is not enabled for your account.' },
        { status: 400 }
      );
    }

    // Send push notification via OneID
    const result = await oneidService.sendPushNotification(user.oneidBindId);

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'oneid_push_sent',
        details: `Push notification sent, request_id: ${result.request_id}`,
      },
    });

    return NextResponse.json({
      success: result.success,
      request_id: result.request_id,
      valid_number: result.valid_number,
    });
  } catch (error) {
    console.error('OneID push send error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'OneID service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send push notification. Please try again later.' },
      { status: 500 }
    );
  }
}
