import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { resetToken, newPassword } = await req.json();

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Verify reset token
    const tokenData = verifyToken(resetToken);
    if (!tokenData || tokenData.mode !== 'password_reset') {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please start over.' },
        { status: 401 }
      );
    }

    const email = tokenData.email as string;
    const phone = tokenData.phone as string;

    // Find user
    const user = await db.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
        isDeleted: false,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'password_reset',
        details: 'Password was reset successfully',
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
