import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, B2BPayoutInitiateParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['amount', 'receiver'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const bkash = getBkashService();

    const params: B2BPayoutInitiateParams = {
      amount: String(body.amount),
      currency: body.currency || 'BDT',
      receiver: String(body.receiver),
      receiverType: body.receiverType,
      ref: body.ref,
      pin: body.pin,
    };

    const result = await bkash.initiateB2BPayout(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        orderId: body.orderId || null,
        userId: body.userId || null,
        operationType: 'b2b_payout',
        disbursementType: 'b2b',
        payoutId: result.payoutID,
        receiverWallet: body.receiver,
        amount: parseFloat(body.amount),
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: 'pending', // B2B requires two-step: initiate then execute
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash B2B payout initiate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'B2B payout initiation failed', details: message },
      { status: 500 }
    );
  }
}
