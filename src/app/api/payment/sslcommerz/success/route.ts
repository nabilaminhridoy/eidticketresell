import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  return handleSuccessCallback(request);
}

export async function POST(request: NextRequest) {
  return handleSuccessCallback(request);
}

async function handleSuccessCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract callback parameters from SSLCommerz
    const tran_id = searchParams.get('tran_id');
    const val_id = searchParams.get('val_id');
    const amount = searchParams.get('amount');
    const card_type = searchParams.get('card_type');
    const card_no = searchParams.get('card_no');
    const card_issuer = searchParams.get('card_issuer');
    const card_brand = searchParams.get('card_brand');
    const bank_tran_id = searchParams.get('bank_tran_id');
    const status = searchParams.get('status');
    const risk_level = searchParams.get('risk_level');
    const risk_title = searchParams.get('risk_title');
    const store_amount = searchParams.get('store_amount');
    const currency = searchParams.get('currency');

    if (!tran_id || !val_id) {
      return NextResponse.redirect(
        new URL('/en/order/failed', request.url)
      );
    }

    // Create SSLCommerz instance for order validation
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Validate the transaction via Order Validation API
    const validation = await sslcz.validateOrder(val_id);

    // Find the PaymentTransaction
    const paymentTransaction = await db.paymentTransaction.findUnique({
      where: { tranId: tran_id },
    });

    if (!paymentTransaction) {
      console.error(`PaymentTransaction not found for tran_id: ${tran_id}`);
      return NextResponse.redirect(
        new URL('/en/order/failed', request.url)
      );
    }

    // Check if validation is VALID/VALIDATED and amounts match
    const isValidPayment =
      (validation.status === 'VALID' || validation.status === 'VALIDATED') &&
      Math.abs(parseFloat(validation.amount || '0') - paymentTransaction.amount) <= 0.01;

    if (isValidPayment) {
      // Update PaymentTransaction with validation data
      await db.paymentTransaction.update({
        where: { tranId: tran_id },
        data: {
          status: 'validated',
          paymentStatus: 'paid',
          valId: val_id,
          bankTranId: bank_tran_id || validation.bank_tran_id,
          cardType: card_type || validation.card_type,
          cardNo: card_no || validation.card_no,
          cardIssuer: card_issuer || validation.card_issuer,
          cardBrand: card_brand,
          storeAmount: parseFloat(store_amount || validation.store_amount || '0'),
          riskLevel: parseInt(risk_level || validation.risk_level || '0'),
          riskTitle: risk_title || validation.risk_title,
          currencyType: currency,
          paidAt: new Date(),
          validatedAt: new Date(),
        },
      });

      // Update linked Order
      if (paymentTransaction.orderId) {
        await db.order.update({
          where: { id: paymentTransaction.orderId },
          data: {
            paymentStatus: 'paid',
            escrowStatus: 'held',
          },
        });
      }

      console.log(`Payment validated successfully for tran_id: ${tran_id}`);

      // Redirect to success page
      return NextResponse.redirect(
        new URL('/en/order/successful', request.url)
      );
    } else {
      // Validation failed - amounts don't match or status not VALID
      console.error(
        `Payment validation failed for tran_id: ${tran_id}. Validation status: ${validation.status}, Validation amount: ${validation.amount}, Stored amount: ${paymentTransaction.amount}`
      );

      await db.paymentTransaction.update({
        where: { tranId: tran_id },
        data: {
          status: 'failed',
          paymentStatus: 'failed',
          valId: val_id,
        },
      });

      return NextResponse.redirect(
        new URL('/en/order/failed', request.url)
      );
    }
  } catch (error) {
    console.error('SSLCommerz success callback error:', error);
    return NextResponse.redirect(
      new URL('/en/order/failed', request.url)
    );
  }
}
