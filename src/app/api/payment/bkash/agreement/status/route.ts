import { NextRequest, NextResponse } from 'next/server';
import { getBkashService, AgreementStatusParams } from '@/lib/bkash';
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

    const params: AgreementStatusParams = {
      agreementID: body.agreementID,
    };

    const result = await bkash.queryAgreementStatus(params);

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        userId: body.userId || null,
        operationType: 'agreement_status',
        agreementId: body.agreementID,
        agreementStatus: result.agreementStatus,
        payerReference: result.payerReference,
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: 'completed',
      },
    });

    // Update existing agreement transactions with latest status
    const existingAgreement = await db.bkashTransaction.findFirst({
      where: { agreementId: body.agreementID },
    });

    if (existingAgreement) {
      await db.bkashTransaction.update({
        where: { id: existingAgreement.id },
        data: {
          agreementStatus: result.agreementStatus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      bkashId,
    });
  } catch (error) {
    console.error('bKash agreement status error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Agreement status query failed', details: message },
      { status: 500 }
    );
  }
}
