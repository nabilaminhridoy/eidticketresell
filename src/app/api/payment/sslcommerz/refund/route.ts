import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tran_id && !body.payId) {
      return NextResponse.json(
        { error: 'Either tran_id or payId is required' },
        { status: 400 }
      );
    }

    if (!body.refund_amount) {
      return NextResponse.json(
        { error: 'refund_amount is required' },
        { status: 400 }
      );
    }

    if (!body.refund_remarks) {
      return NextResponse.json(
        { error: 'refund_remarks is required' },
        { status: 400 }
      );
    }

    // Find the PaymentTransaction
    let paymentTransaction;

    if (body.payId) {
      paymentTransaction = await db.paymentTransaction.findUnique({
        where: { payId: body.payId },
      });
    } else {
      paymentTransaction = await db.paymentTransaction.findUnique({
        where: { tranId: body.tran_id },
      });
    }

    if (!paymentTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (!paymentTransaction.bankTranId) {
      return NextResponse.json(
        { error: 'Transaction has no bank_tran_id - cannot initiate refund' },
        { status: 400 }
      );
    }

    // Create SSLCommerz instance
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Generate refund transaction ID
    const refund_trans_id = `REF-${paymentTransaction.payId}-${Date.now()}`;

    // Initiate refund via SSLCommerz
    const refundResponse = await sslcz.initiateRefund({
      bank_tran_id: paymentTransaction.bankTranId,
      refund_trans_id,
      refund_amount: String(body.refund_amount),
      refund_remarks: body.refund_remarks,
    });

    // Update PaymentTransaction with refund data
    await db.paymentTransaction.update({
      where: { id: paymentTransaction.id },
      data: {
        refundRefId: refundResponse.refund_ref_id || refund_trans_id,
        refundAmount: parseFloat(String(body.refund_amount)),
        refundStatus: 'processing',
        refundRemarks: body.refund_remarks,
      },
    });

    // Update linked Order if exists
    if (paymentTransaction.orderId) {
      await db.order.update({
        where: { id: paymentTransaction.orderId },
        data: {
          paymentStatus: 'refunded',
          escrowStatus: 'refunded',
        },
      });
    }

    return NextResponse.json({
      status: 'success',
      refund: refundResponse,
      refund_trans_id,
    });
  } catch (error) {
    console.error('SSLCommerz refund initiation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Refund initiation failed', details: message },
      { status: 500 }
    );
  }
}
