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
    const gateway = searchParams.get('gateway');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // We use transactions from wallets to track payments
    // In a real system, there would be a dedicated Payment model
    // For now, we query the Transaction model for payment-related records
    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.type = status === 'success' ? 'credit' : status === 'failed' ? 'debit' : status;
    }

    const skip = (page - 1) * limit;

    // Since there's no dedicated Payment model, we use transactions
    // filtered by payment-related descriptions
    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where: {
          ...where,
          description: { contains: search || '', mode: 'insensitive' },
        },
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
      db.transaction.count({
        where: {
          ...where,
          description: { contains: search || '', mode: 'insensitive' },
        },
      }),
    ]);

    // Map transactions to payment-like format
    const payments = transactions.map(tx => ({
      id: tx.id,
      txnId: tx.txnId,
      wltId: tx.wltId,
      orderId: tx.orderId || '',
      buyerId: tx.wallet.user.id,
      buyerName: tx.wallet.user.name,
      amount: tx.amount,
      gateway: tx.description?.includes('bkash') ? 'bkash' : tx.description?.includes('sslcommerz') ? 'sslcommerz' : 'unknown',
      gatewayTransactionId: tx.description || '',
      status: tx.type === 'credit' ? 'success' : tx.type === 'debit' ? 'pending' : 'pending',
      createdAt: tx.createdAt,
    }));

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
