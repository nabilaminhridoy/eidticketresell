import { NextRequest, NextResponse } from 'next/server';
import { getBkashService } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const bkash = getBkashService();

    // Refresh existing token
    const result = await bkash.refreshToken();

    // Track this in BkashTransaction
    const bkashId = await generatePrefixedId('BKASH');
    await db.bkashTransaction.create({
      data: {
        bkashId,
        operationType: 'payment_execute', // token refresh operation
        accessToken: result.id_token,
        refreshToken: result.refresh_token,
        tokenExpiresAt: new Date(Date.now() + result.expires_in * 1000),
        statusCode: result.statusCode,
        statusMessage: result.statusMessage || null,
        rawResponse: JSON.stringify(result),
        status: 'completed',
      },
    });

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
    console.error('bKash refresh token error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Refresh token failed', details: message },
      { status: 500 }
    );
  }
}
