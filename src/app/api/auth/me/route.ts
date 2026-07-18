import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
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

    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      include: {
        wallet: true,
        kyc: true,
      },
    });

    if (!user || user.isDeleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isKycVerified: user.isKycVerified,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              availableBalance: user.wallet.availableBalance,
              pendingBalance: user.wallet.pendingBalance,
              escrowBalance: user.wallet.escrowBalance,
              totalEarnings: user.wallet.totalEarnings,
              totalWithdrawn: user.wallet.totalWithdrawn,
            }
          : null,
        kyc: user.kyc
          ? {
              id: user.kyc.id,
              documentType: user.kyc.documentType,
              status: user.kyc.status,
              submittedAt: user.kyc.submittedAt,
              reviewedAt: user.kyc.reviewedAt,
              reviewNote: user.kyc.reviewNote,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
