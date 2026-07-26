import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, ConfirmPaymentParams } from '@/lib/bkash';
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

    const params: ConfirmPaymentParams = {
      paymentID: body.paymentID,
    };

    const result = await bkash.confirmPayment(params);

    // Find existing BkashTransaction by paymentID and update
    const existingTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: body.paymentID },
    });

    if (existingTxn) {
      const isSuccess = result.statusCode === '0000';
      await db.bkashTransaction.update({
        where: { id: existingTxn.id },
        data: {
          captureStatus: 'Captured',
          captureTrxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          rawResponse: JSON.stringify(result),
          status: isSuccess ? 'completed' : 'failed',
        },
      });

      // If capture successful and linked to an order, update payment status
      if (isSuccess && existingTxn.orderId) {
        await db.order.update({
          where: { id: existingTxn.orderId },
          data: {
            paymentStatus: 'paid',
            escrowStatus: 'held',
          },
        });
      }
    } else {
      // Create a new tracking record
      const bkashId = await generatePrefixedId('BKASH');
      await db.bkashTransaction.create({
        data: {
          bkashId,
          orderId: body.orderId || null,
          userId: body.userId || null,
          operationType: 'payment_capture',
          paymentId: body.paymentID,
          trxId: result.trxId,
          captureStatus: 'Captured',
          captureTrxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
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
    console.error('bKash confirm/capture payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Capture payment failed', details: message },
      { status: 500 }
    );
  }
}
