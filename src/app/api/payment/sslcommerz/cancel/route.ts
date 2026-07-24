import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  return handleCancelCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCancelCallback(request);
}

async function handleCancelCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get('tran_id');

    if (tran_id) {
      // Find and update the PaymentTransaction status to cancelled
      const paymentTransaction = await db.paymentTransaction.findUnique({
        where: { tranId: tran_id },
      });

      if (paymentTransaction) {
        await db.paymentTransaction.update({
          where: { tranId: tran_id },
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
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

        console.log(`Payment cancelled for tran_id: ${tran_id}`);
      } else {
        console.error(`PaymentTransaction not found for tran_id: ${tran_id}`);
      }
    }

    // Redirect customer to cancelled page
    return NextResponse.redirect(
      new URL('/en/order/cancelled', request.url)
    );
  } catch (error) {
    console.error('SSLCommerz cancel callback error:', error);
    return NextResponse.redirect(
      new URL('/en/order/cancelled', request.url)
    );
  }
}
