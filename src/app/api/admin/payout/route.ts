import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: {
                select: { id: true, name: true, username: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.withdrawal.count({ where }),
    ]);

    // Map withdrawals with seller info
    const mappedWithdrawals = withdrawals.map(w => ({
      ...w,
      seller: w.wallet.user,
    }));

    return NextResponse.json({
      withdrawals: mappedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin payouts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const withdrawalId = searchParams.get('id');

    if (!withdrawalId) {
      return NextResponse.json({ error: 'Withdrawal ID is required as query parameter' }, { status: 400 });
    }

    const body = await req.json();
    const { status, reviewNote } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be either "approved" or "rejected"' }, { status: 400 });
    }

    const existingWithdrawal = await db.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!existingWithdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    if (existingWithdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending withdrawals can be reviewed' }, { status: 400 });
    }

    // Update withdrawal in transaction
    const result = await db.$transaction(async (tx) => {
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          reviewedBy: payload.id as string,
          reviewNote: reviewNote || null,
        },
      });

      if (status === 'approved') {
        // Deduct from available balance
        await tx.wallet.update({
          where: { id: existingWithdrawal.walletId },
          data: {
            availableBalance: { decrement: existingWithdrawal.amount },
            totalWithdrawn: { increment: existingWithdrawal.amount },
          },
        });

        // Create debit transaction
        await tx.transaction.create({
          data: {
            walletId: existingWithdrawal.walletId,
            type: 'debit',
            amount: existingWithdrawal.amount,
            balance: existingWithdrawal.wallet.availableBalance - existingWithdrawal.amount,
            description: `Withdrawal approved - ${existingWithdrawal.method} - ${existingWithdrawal.accountDetails}`,
          },
        });
      }

      return updatedWithdrawal;
    });

    // Create notification for user
    const wallet = await db.wallet.findUnique({
      where: { id: existingWithdrawal.walletId },
      include: { user: true },
    });

    if (wallet?.user) {
      await db.notification.create({
        data: {
          userId: wallet.user.id,
          title: status === 'approved' ? 'Withdrawal Approved' : 'Withdrawal Rejected',
          message:
            status === 'approved'
              ? `Your withdrawal of ৳${existingWithdrawal.amount.toLocaleString()} has been approved and will be processed shortly.`
              : `Your withdrawal of ৳${existingWithdrawal.amount.toLocaleString()} has been rejected. Reason: ${reviewNote || 'Please contact support.'}`,
          type: status === 'approved' ? 'success' : 'error',
        },
      });
    }

    return NextResponse.json({ withdrawal: result });
  } catch (error) {
    console.error('Review withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
