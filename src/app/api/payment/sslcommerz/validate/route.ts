import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const val_id = searchParams.get('val_id');

    if (!val_id) {
      return NextResponse.json(
        { error: 'val_id parameter is required' },
        { status: 400 }
      );
    }

    // Create SSLCommerz instance
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Validate the order via SSLCommerz API
    const validation = await sslcz.validateOrder(val_id);

    // If validation is VALID/VALIDATED, also update the PaymentTransaction in our database
    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      const tran_id = validation.tran_id;

      if (tran_id) {
        const paymentTransaction = await db.paymentTransaction.findUnique({
          where: { tranId: tran_id },
        });

        if (paymentTransaction) {
          // Validate amount matches
          const validationAmount = parseFloat(validation.amount || '0');
          const isValidAmount = Math.abs(validationAmount - paymentTransaction.amount) <= 0.01;

          await db.paymentTransaction.update({
            where: { tranId: tran_id },
            data: {
              status: validation.status.toLowerCase(),
              paymentStatus: isValidAmount ? 'paid' : 'failed',
              valId: val_id,
              bankTranId: validation.bank_tran_id,
              cardType: validation.card_type,
              cardNo: validation.card_no,
              cardIssuer: validation.card_issuer,
              cardBrand: validation.card_type_name,
              storeAmount: parseFloat(validation.store_amount || '0'),
              riskLevel: parseInt(validation.risk_level || '0'),
              riskTitle: validation.risk_title,
              validatedAt: new Date(),
            },
          });

          // Update linked Order if VALID and amounts match
          if (isValidAmount && paymentTransaction.orderId) {
            await db.order.update({
              where: { id: paymentTransaction.orderId },
              data: {
                paymentStatus: 'paid',
                escrowStatus: 'held',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      validation,
    });
  } catch (error) {
    console.error('SSLCommerz validate order error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Order validation failed', details: message },
      { status: 500 }
    );
  }
}
