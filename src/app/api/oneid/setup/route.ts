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

    // Check user doesn't already have MFA enabled
    if (user.oneidMfaEnabled) {
      return NextResponse.json(
        { error: 'MFA is already enabled for your account. Disable it first to set up again.' },
        { status: 400 }
      );
    }

    // Create unclaimed binding via OneID
    const binding = await oneidService.createUnclaimedBinding();

    // Store the bind_id temporarily on the user record
    // (We'll verify it in the verify-totp step before enabling MFA)
    await db.user.update({
      where: { id: userId },
      data: { oneidBindId: binding.bind_id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'oneid_mfa_setup_initiated',
        details: 'MFA setup initiated, binding created',
      },
    });

    return NextResponse.json({
      bind_id: binding.bind_id,
      qr_code: binding.qr_code,
      algorithm: binding.algorithm,
    });
  } catch (error) {
    console.error('OneID setup error:', error);

    // Check if it's an OneID configuration error
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'OneID service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to set up MFA. Please try again later.' },
      { status: 500 }
    );
  }
}
