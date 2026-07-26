import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, CancelAgreementParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.agreementID) {
      return NextResponse.json(
        { error: 'Missing required field: agreementID' },
        { status: 400 }
      );
    }

    const bkash = getBkashService();

    const params: CancelAgreementParams = {
      agreementID: body.agreementID,
    };

    const result = await bkash.cancelAgreement(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        userId: body.userId || null,
        operationType: 'agreement_cancel',
        agreementId: body.agreementID,
        agreementStatus: 'Cancelled',
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
        rawResponse: JSON.stringify(result),
        status: result.statusCode === '0000' ? 'cancelled' : 'failed',
      },
    });

    // Update all existing transactions for this agreement
    const existingTxns = await db.bkashTransaction.findMany({
      where: { agreementId: body.agreementID },
    });

    for (const txn of existingTxns) {
      if (txn.id !== bkashId) {
        await db.bkashTransaction.update({
          where: { id: txn.id },
          data: {
            agreementStatus: 'Cancelled',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash cancel agreement error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Cancel agreement failed', details: message },
      { status: 500 }
    );
  }
}
