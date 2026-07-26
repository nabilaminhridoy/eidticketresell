import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, ExecutePaymentParams } from '@/lib/bkash';
import { db } from '@/lib/db';

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

    const params: ExecutePaymentParams = {
      paymentID: body.paymentID,
    };

    const result = await bkash.executePayment(params);

    // Find existing BkashTransaction by paymentID to update it
    const existingTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: body.paymentID },
    });

    if (existingTxn) {
      // Update the existing transaction with execution results
      const isSuccess = result.statusCode === '0000';
      await db.bkashTransaction.update({
        where: { id: existingTxn.id },
        data: {
          trxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          rawResponse: JSON.stringify(result),
          status: isSuccess ? 'completed' : 'failed',
        },
      });

      // If payment is successful and linked to an order, update the order
      if (isSuccess && existingTxn.orderId) {
        await db.order.update({
          where: { id: existingTxn.orderId },
          data: {
            paymentStatus: 'paid',
            escrowStatus: 'held',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('bKash execute payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Execute payment failed', details: message },
      { status: 500 }
    );
  }
}
