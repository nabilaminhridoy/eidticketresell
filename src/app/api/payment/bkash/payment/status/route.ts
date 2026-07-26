import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, PaymentStatusParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.paymentID) {
      return NextResponse.json(
        { error: 'Missing required field: paymentID' },
        { status: 400 }
      );
    }

    const bkash = getBkashService();

    const params: PaymentStatusParams = {
      paymentID: body.paymentID,
    };

    const result = await bkash.queryPaymentStatus(params);

    // Find existing BkashTransaction and update with status
    const existingTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: body.paymentID },
    });

    if (existingTxn) {
      // Update the existing transaction with status results
      const statusMapping: Record<string, string> = {
        '0000': 'completed',
        '2065': 'cancelled',
        '2041': 'failed',
        '2043': 'failed',
      };

      await db.bkashTransaction.update({
        where: { id: existingTxn.id },
        data: {
          trxId: result.trxId || existingTxn.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          payerReference: result.payerReference || existingTxn.payerReference,
          rawResponse: JSON.stringify(result),
          status: statusMapping[result.statusCode] || 'pending',
        },
      });
    } else {
      // Create a tracking record for this status query
      const bkashId = await generatePrefixedId('BKASH');
      await db.bkashTransaction.create({
        data: {
          bkashId,
          operationType: 'payment_status',
          paymentId: body.paymentID,
          trxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          payerReference: result.payerReference || null,
          rawResponse: JSON.stringify(result),
          status: 'completed',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('bKash payment status error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Payment status query failed', details: message },
      { status: 500 }
    );
  }
}
