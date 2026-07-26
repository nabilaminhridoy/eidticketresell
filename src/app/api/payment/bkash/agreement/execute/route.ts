import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, ExecuteAgreementParams } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.paymentID) {
      return NextResponse.json(
        { error: 'Missing required field: paymentID' },
        { status: 400 }
      );
    }

    const bkash = getBkashService();

    const params: ExecuteAgreementParams = {
      paymentID: body.paymentID,
    };

    const result = await bkash.executeAgreement(params);

    // Find existing BkashTransaction by paymentID to update it
    const existingTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: body.paymentID },
    });

    if (existingTxn) {
      // Update the existing transaction with execution results
      await db.bkashTransaction.update({
        where: { id: existingTxn.id },
        data: {
          agreementId: result.agreementID,
          trxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          rawResponse: JSON.stringify(result),
          status: result.statusCode === '0000' ? 'completed' : 'failed',
        },
      });
    } else {
      // Create a new tracking record if not found
      const bkashId = await generatePrefixedId('BKASH');
      await db.bkashTransaction.create({
        data: {
          bkashId,
          orderId: body.orderId || null,
          userId: body.userId || null,
          operationType: 'agreement_execute',
          agreementId: result.agreementID,
          paymentId: body.paymentID,
          trxId: result.trxId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          rawResponse: JSON.stringify(result),
          status: result.statusCode === '0000' ? 'completed' : 'failed',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('bKash execute agreement error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Execute agreement failed', details: message },
      { status: 500 }
    );
  }
}
