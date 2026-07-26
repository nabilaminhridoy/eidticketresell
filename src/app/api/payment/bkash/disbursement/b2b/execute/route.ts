import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, B2BPayoutExecuteParams } from '@/lib/bkash';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['payoutID', 'pin'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const bkash = getBkashService();

    const params: B2BPayoutExecuteParams = {
      payoutID: String(body.payoutID),
      pin: String(body.pin),
    };

    const result = await bkash.executeB2BPayout(params);

    // Find existing BkashTransaction by payoutId and update
    const existingTxn = await db.bkashTransaction.findFirst({
      where: { payoutId: body.payoutID },
    });

    if (existingTxn) {
      await db.bkashTransaction.update({
        where: { id: existingTxn.id },
        data: {
          disbursementTrxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage || null,
          rawResponse: JSON.stringify(result),
          status: result.statusCode === '0000' ? 'completed' : 'failed',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('bKash B2B payout execute error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'B2B payout execution failed', details: message },
      { status: 500 }
    );
  }
}
