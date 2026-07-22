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
    const { totp_code } = await req.json();

    if (!totp_code) {
      return NextResponse.json(
        { error: 'TOTP code is required to disable MFA' },
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

    // Check MFA is currently enabled
    if (!user.oneidMfaEnabled) {
      return NextResponse.json(
        { error: 'MFA is not enabled for your account.' },
        { status: 400 }
      );
    }

    if (!user.oneidBindId) {
      return NextResponse.json(
        { error: 'No binding found. Please contact support.' },
        { status: 400 }
      );
    }

    // Verify TOTP code using user's bind_id
    const result = await oneidService.verifyTotp(user.oneidBindId, totp_code);

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code. Please try again.' },
        { status: 400 }
      );
    }

    // Delete the binding from OneID
    try {
      await oneidService.deleteBinding(user.oneidBindId);
    } catch (deleteError) {
      console.error('OneID delete binding error (continuing with disable):', deleteError);
      // Continue disabling MFA even if OneID deletion fails
      // The binding may already be removed or the service may be unavailable
    }

    // Update user: disable MFA and clear binding
    await db.user.update({
      where: { id: userId },
      data: {
        oneidMfaEnabled: false,
        oneidBindId: null,
        oneidAlgorithm: null,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'oneid_mfa_disabled',
        details: 'OneID MFA disabled successfully',
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('OneID disable error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'OneID service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to disable MFA. Please try again later.' },
      { status: 500 }
    );
  }
}
