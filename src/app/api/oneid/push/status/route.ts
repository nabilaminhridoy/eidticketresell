import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { oneidService } from '@/lib/oneid';

export async function GET(req: NextRequest) {
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
    const requestId = req.nextUrl.searchParams.get('request_id');

    if (!requestId) {
      return NextResponse.json(
        { error: 'request_id query parameter is required' },
        { status: 400 }
      );
    }

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

    // Check push status via OneID
    const result = await oneidService.checkPushStatus(requestId);

    // Handle status updates
    if (result.status === 'verified') {
      // Update last verified timestamp
      await db.user.update({
        where: { id: userId },
        data: { oneidLastVerifiedAt: new Date() },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'oneid_mfa_login_success',
          details: 'MFA push verification approved',
        },
      });
    } else if (result.status === 'failed') {
      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'oneid_mfa_login_failed',
          details: 'MFA push verification rejected',
        },
      });
    } else if (result.status === 'expired') {
      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'oneid_mfa_login_failed',
          details: 'MFA push verification expired',
        },
      });
    }

    return NextResponse.json({ status: result.status });
  } catch (error) {
    console.error('OneID push status error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'OneID service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check push status. Please try again later.' },
      { status: 500 }
    );
  }
}
