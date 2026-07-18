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

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      db.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              username: true,
              avatar: true,
              createdAt: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.kyc.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin KYC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const kycId = searchParams.get('id');

    if (!kycId) {
      return NextResponse.json(
        { error: 'KYC ID is required as query parameter' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, reviewNote } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const existingKyc = await db.kyc.findUnique({
      where: { id: kycId },
      include: { user: true },
    });

    if (!existingKyc) {
      return NextResponse.json(
        { error: 'KYC application not found' },
        { status: 404 }
      );
    }

    if (existingKyc.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending applications can be reviewed' },
        { status: 400 }
      );
    }

    // Update KYC and user in transaction
    const result = await db.$transaction(async (tx) => {
      const updatedKyc = await tx.kyc.update({
        where: { id: kycId },
        data: {
          status,
          reviewedBy: payload.id as string,
          reviewNote: reviewNote || null,
          reviewedAt: new Date(),
        },
      });

      if (status === 'approved') {
        await tx.user.update({
          where: { id: existingKyc.userId },
          data: {
            isKycVerified: true,
            role: 'verified_seller',
          },
        });
      }

      return updatedKyc;
    });

    // Create notification for user
    await db.notification.create({
      data: {
        userId: existingKyc.userId,
        title: status === 'approved' ? 'KYC Approved!' : 'KYC Rejected',
        message:
          status === 'approved'
            ? 'Congratulations! Your KYC verification has been approved. You are now a verified seller.'
            : `Your KYC verification has been rejected. Reason: ${reviewNote || 'Documents could not be verified. Please resubmit with clear documents.'}`,
        type: status === 'approved' ? 'success' : 'error',
      },
    });

    return NextResponse.json({ kyc: result });
  } catch (error) {
    console.error('Review KYC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
