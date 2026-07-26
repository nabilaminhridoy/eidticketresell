import { NextRequest, NextResponse } from 'next/server';
import { getBkashService } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bkash = getBkashService();

    // Grant new token from bKash
    const result = await bkash.grantToken();

    // Track this in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        operationType: 'payment_create', // token operations tracked separately
        accessToken: result.id_token,
        refreshToken: result.refresh_token,
        tokenExpiresAt: new Date(Date.now() + result.expires_in * 1000),
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: 'completed',
      },
    });

    // Don't expose the full id_token in response for security
    return NextResponse.json({
      success: true,
      data: {
        token_type: result.token_type,
        expires_in: result.expires_in,
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
      },
      bkashId,
    });
  } catch (error) {
    console.error('bKash grant token error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Grant token failed', details: message },
      { status: 500 }
    );
  }
}
