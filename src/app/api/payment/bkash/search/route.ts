import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, SearchTransactionParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.trxID) {
      return NextResponse.json(
        { error: 'Missing required field: trxID' },
        { status: 400 }
      );
    }

    const bkash = getBkashService();

    const params: SearchTransactionParams = {
      trxID: body.trxID,
    };

    const result = await bkash.searchTransaction(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        operationType: 'search_transaction',
        trxId: result.trxId,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || null,
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        payerReference: result.payerReference || null,
        merchantInvoiceNumber: result.merchantInvoiceNumber || null,
        rawResponse: JSON.stringify(result),
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash search transaction error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Search transaction failed', details: message },
      { status: 500 }
    );
  }
}
