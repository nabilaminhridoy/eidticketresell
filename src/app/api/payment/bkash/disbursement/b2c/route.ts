import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, B2CPayoutParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['amount', 'pin', 'receiver'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const bkash = getBkashService();

    const params: B2CPayoutParams = {
      amount: String(body.amount),
      pin: String(body.pin),
      receiver: String(body.receiver),
      currency: body.currency || 'BDT',
    };

    const result = await bkash.b2cPayout(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        orderId: body.orderId || null,
        userId: body.userId || null,
        operationType: 'b2c_payout',
        disbursementType: 'b2c',
        disbursementTrxId: result.trxId,
        receiverWallet: body.receiver,
        amount: parseFloat(body.amount),
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: result.statusCode === '0000' ? 'completed' : 'failed',
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash B2C payout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'B2C payout failed', details: message },
      { status: 500 }
    );
  }
}
