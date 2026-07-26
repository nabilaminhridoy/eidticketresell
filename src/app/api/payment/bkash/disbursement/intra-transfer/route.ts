import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, IntraAccountTransferParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['amount', 'transferType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate transferType
    if (body.transferType !== 'collection2disbursement' && body.transferType !== 'disbursement2collection') {
      return NextResponse.json(
        { error: 'Invalid transferType. Must be "collection2disbursement" or "disbursement2collection"' },
        { status: 400 }
      );
    }

    const bkash = getBkashService();

    const params: IntraAccountTransferParams = {
      amount: String(body.amount),
      currency: body.currency || 'BDT',
      transferType: body.transferType,
    };

    const result = await bkash.intraAccountTransfer(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        operationType: 'intra_transfer',
        disbursementType: 'intra_transfer',
        disbursementTrxId: result.trxId,
        amount: parseFloat(body.amount),
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: result.statusCode === '0000' ? 'completed' : 'failed',
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash intra account transfer error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Intra account transfer failed', details: message },
      { status: 500 }
    );
  }
}
