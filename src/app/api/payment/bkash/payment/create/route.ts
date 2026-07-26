import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, CreatePaymentParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['payerReference', 'agreementID', 'amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Build callback URL - use the request origin
    const origin = new URL(request.url).origin;
    const callbackURL = body.callbackURL || `${origin}/api/payment/bkash/callback`;

    const bkash = getBkashService();

    const params: CreatePaymentParams = {
      mode: '0001',
      payerReference: body.payerReference,
      agreementID: body.agreementID,
      callbackURL,
      amount: String(body.amount),
      currency: body.currency || 'BDT',
      intent: body.intent || 'Sale',
      merchantInvoiceNumber: body.merchantInvoiceNumber,
      merchantAssociationInfo: body.merchantAssociationInfo,
    };

    const result = await bkash.createPayment(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        orderId: body.orderId || null,
        userId: body.userId || null,
        operationType: 'payment_create',
        agreementId: body.agreementID,
        payerReference: body.payerReference,
        agreementMode: '0001',
        paymentId: result.paymentID,
        bkashURL: result.bkashURL,
        amount: parseFloat(String(body.amount)),
        currency: body.currency || 'BDT',
        intent: body.intent || 'Sale',
        merchantInvoiceNumber: body.merchantInvoiceNumber || null,
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
        rawResponse: JSON.stringify(result),
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash create payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Create payment failed', details: message },
      { status: 500 }
    );
  }
}
