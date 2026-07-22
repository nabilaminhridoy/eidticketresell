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
    const { bind_id, code, purpose } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'TOTP code is required' },
        { status: 400 }
      );
    }

    if (!purpose || !['setup', 'login'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Purpose must be "setup" or "login"' },
        { status: 400 }
      );
    }

    // bind_id is required for setup, optional for login (uses stored value)
    if (purpose === 'setup' && !bind_id) {
      return NextResponse.json(
        { error: 'Bind ID is required for setup' },
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

    if (purpose === 'setup') {
      // === Setup flow ===

      // Check MFA not already enabled
      if (user.oneidMfaEnabled) {
        return NextResponse.json(
          { error: 'MFA is already enabled for your account.' },
          { status: 400 }
        );
      }

      // Verify the bind_id belongs to this user (stored during setup)
      if (user.oneidBindId !== bind_id) {
        return NextResponse.json(
          { error: 'Invalid binding ID. Please restart MFA setup.' },
          { status: 400 }
        );
      }

      // Verify TOTP code via OneID
      const result = await oneidService.verifyTotp(bind_id, code);

      if (result.valid) {
        // Enable MFA on user account
        await db.user.update({
          where: { id: userId },
          data: {
            oneidMfaEnabled: true,
            oneidBindId: bind_id,
            oneidAlgorithm: 'SHA1',
            oneidLastVerifiedAt: new Date(),
          },
        });

        // Log activity
        await db.activityLog.create({
          data: {
            userId,
            action: 'oneid_mfa_enabled',
            details: 'OneID MFA enabled successfully',
          },
        });

        return NextResponse.json({
          success: true,
          message: result.message || 'MFA enabled successfully',
        });
      } else {
        return NextResponse.json({
          success: false,
          message: result.message || 'Invalid TOTP code',
        });
      }
    } else {
      // === Login flow ===

      // Check user has MFA enabled
      if (!user.oneidMfaEnabled || !user.oneidBindId) {
        return NextResponse.json(
          { error: 'MFA is not enabled for your account.' },
          { status: 400 }
        );
      }

      // Use user's stored bind_id (ignore the one in the request body for security)
      const userBindId = user.oneidBindId;

      // Verify TOTP code via OneID
      const result = await oneidService.verifyTotp(userBindId, code);

      if (result.valid) {
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
            details: 'MFA login verification successful',
          },
        });

        return NextResponse.json({
          valid: true,
          message: result.message || 'MFA verification successful',
        });
      } else {
        // Log failed attempt
        await db.activityLog.create({
          data: {
            userId,
            action: 'oneid_mfa_login_failed',
            details: 'MFA login verification failed',
          },
        });

        return NextResponse.json({
          valid: false,
          message: result.message || 'Invalid TOTP code',
        });
      }
    }
  } catch (error) {
    console.error('OneID verify TOTP error:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'OneID service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify TOTP. Please try again later.' },
      { status: 500 }
    );
  }
}
