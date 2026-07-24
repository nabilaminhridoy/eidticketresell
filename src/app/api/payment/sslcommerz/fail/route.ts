import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  return handleFailCallback(request);
}

export async function POST(request: NextRequest) {
  return handleFailCallback(request);
}

async function handleFailCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get('tran_id');

    if (tran_id) {
      // Find and update the PaymentTransaction status to failed
      const paymentTransaction = await db.paymentTransaction.findUnique({
        where: { tranId: tran_id },
      });

      if (paymentTransaction) {
        await db.paymentTransaction.update({
          where: { tranId: tran_id },
          data: {
            status: 'failed',
            paymentStatus: 'failed',
            bankTranId: searchParams.get('bank_tran_id') || undefined,
            cardType: searchParams.get('card_type') || undefined,
            cardNo: searchParams.get('card_no') || undefined,
            cardIssuer: searchParams.get('card_issuer') || undefined,
          },
        });

        // Update linked Order if exists
        if (paymentTransaction.orderId) {
          await db.order.update({
            where: { id: paymentTransaction.orderId },
            data: {
              paymentStatus: 'failed',
            },
          });
        }

        console.log(`Payment failed for tran_id: ${tran_id}`);
      } else {
        console.error(`PaymentTransaction not found for tran_id: ${tran_id}`);
      }
    }

    // Redirect customer to failed page
    return NextResponse.redirect(
      new URL('/en/order/failed', request.url)
    );
  } catch (error) {
    console.error('SSLCommerz fail callback error:', error);
    return NextResponse.redirect(
      new URL('/en/order/failed', request.url)
    );
  }
}
