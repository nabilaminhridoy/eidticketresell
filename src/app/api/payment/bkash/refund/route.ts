import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, RefundParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['paymentId', 'trxId', 'refundAmount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const bkash = getBkashService();

    const params: RefundParams = {
      paymentId: body.paymentId,
      trxId: body.trxId,
      refundAmount: String(body.refundAmount),
      sku: body.sku,
      reason: body.reason,
    };

    const result = await bkash.refund(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        orderId: body.orderId || null,
        userId: body.userId || null,
        operationType: 'refund',
        paymentId: body.paymentId,
        trxId: result.originalTrxId || body.trxId,
        refundTrxId: result.refundTrxId,
        refundAmount: parseFloat(body.refundAmount),
        refundStatus: result.refundTransactionStatus,
        refundReason: body.reason || null,
        refundSku: body.sku || null,
        statusCode: result.statusCode || null,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: result.refundTransactionStatus === 'Processed' ? 'completed' : 'pending',
      },
    });

    // Update existing payment transaction with refund info
    const existingPaymentTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: body.paymentId, operationType: 'payment_create' },
    });

    if (existingPaymentTxn) {
      await db.bkashTransaction.update({
        where: { id: existingPaymentTxn.id },
        data: {
          refundTrxId: result.refundTrxId,
          refundAmount: parseFloat(body.refundAmount),
          refundStatus: result.refundTransactionStatus,
          refundReason: body.reason || null,
          status: 'cancelled',
        },
      });
    }

    // Update linked Order if refund successful
    if (result.refundTransactionStatus === 'Processed' && body.orderId) {
      await db.order.update({
        where: { id: body.orderId },
        data: {
          paymentStatus: 'refunded',
          escrowStatus: 'refunded',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash refund error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Refund failed', details: message },
      { status: 500 }
    );
  }
}
