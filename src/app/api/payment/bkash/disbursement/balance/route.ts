import { NextResponse } from 'next/server';
import { getBkashService } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function GET() {
  try {
    const bkash = getBkashService();

    const result = await bkash.queryOrganizationBalance();

    // Track in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        operationType: 'org_balance',
        disbursementType: 'org_balance',
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
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
    console.error('bKash organization balance error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Organization balance query failed', details: message },
      { status: 500 }
    );
  }
}
