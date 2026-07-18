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

    const wallet = await db.wallet.findUnique({
      where: { userId: payload.id as string },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance,
        pendingBalance: wallet.pendingBalance,
        escrowBalance: wallet.escrowBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawn: wallet.totalWithdrawn,
        transactions: wallet.transactions,
        withdrawals: wallet.withdrawals,
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { amount, method, accountDetails } = body;

    if (!amount || !method || !accountDetails) {
      return NextResponse.json(
        { error: 'amount, method, and accountDetails are required' },
        { status: 400 }
      );
    }

    if (!['bkash', 'bank_transfer'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal method. Must be: bkash or bank_transfer' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Withdrawal amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ৳100' },
        { status: 400 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: payload.id as string },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    if (wallet.availableBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient available balance' },
        { status: 400 }
      );
    }

    // Create withdrawal and deduct balance
    const withdrawal = await db.$transaction(async (tx) => {
      // Deduct from available balance and add to pending
      await tx.wallet.update({
        where: { userId: payload.id as string },
        data: {
          availableBalance: { decrement: amount },
          pendingBalance: { increment: amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: amount,
          balance: wallet.availableBalance - amount,
          description: `Withdrawal request via ${method}`,
        },
      });

      // Create withdrawal record
      return tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amount,
          method,
          accountDetails,
          status: 'pending',
        },
      });
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: payload.id as string,
        title: 'Withdrawal Requested',
        message: `Your withdrawal request of ৳${amount} via ${method === 'bkash' ? 'bKash' : 'Bank Transfer'} has been submitted and is pending review.`,
        type: 'info',
      },
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
