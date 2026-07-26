import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, CreateAgreementParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.payerReference) {
      return NextResponse.json(
        { error: 'Missing required field: payerReference' },
        { status: 400 }
      );
    }

    // Build callback URL - use the request origin
    const origin = new URL(request.url).origin;
    const callbackURL = body.callbackURL || `${origin}/api/payment/bkash/callback`;

    const bkash = getBkashService();

    const params: CreateAgreementParams = {
      mode: '0000',
      payerReference: body.payerReference,
      callbackURL,
      amount: body.amount || '1',
      currency: body.currency || 'BDT',
      intent: body.intent || 'Sale',
      merchantInvoiceNumber: body.merchantInvoiceNumber,
    };

    const result = await bkash.createAgreement(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        orderId: body.orderId || null,
        userId: body.userId || null,
        operationType: 'agreement_create',
        payerReference: body.payerReference,
        agreementMode: '0000',
        paymentId: result.paymentID,
        bkashURL: result.bkashURL,
        amount: parseFloat(body.amount || '1'),
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
    console.error('bKash create agreement error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Create agreement failed', details: message },
      { status: 500 }
    );
  }
}
