import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refund_ref_id = searchParams.get('refund_ref_id');

    if (!refund_ref_id) {
      return NextResponse.json(
        { error: 'refund_ref_id parameter is required' },
        { status: 400 }
      );
    }

    // Create SSLCommerz instance
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Query refund status from SSLCommerz
    const refundStatus = await sslcz.queryRefundStatus(refund_ref_id);

    // Also update our database if refund is completed or cancelled
    const paymentTransaction = await db.paymentTransaction.findFirst({
      where: { refundRefId: refund_ref_id },
    });

    if (paymentTransaction && refundStatus.refund_status) {
      const refundStatusMapping: Record<string, string> = {
        refunded: 'refunded',
        cancelled: 'cancelled',
        processing: 'processing',
        pending: 'processing',
      };

      const mappedRefundStatus = refundStatusMapping[refundStatus.refund_status] || 'processing';

      await db.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: {
          refundStatus: mappedRefundStatus,
          refundedAt: refundStatus.refund_status === 'refunded' ? new Date() : undefined,
        },
      });

      // Update linked Order if refund is fully completed
      if (refundStatus.refund_status === 'refunded' && paymentTransaction.orderId) {
        await db.order.update({
          where: { id: paymentTransaction.orderId },
          data: {
            paymentStatus: 'refunded',
            escrowStatus: 'refunded',
          },
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      refundStatus,
      databaseRecord: paymentTransaction,
    });
  } catch (error) {
    console.error('SSLCommerz refund status query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Refund status query failed', details: message },
      { status: 500 }
    );
  }
}
