import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: username, password' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const result = await sslcz.generateQuickBankPayToken(username, password);

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Token generation failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      expires_at: result.expires_at,
    });
  } catch (error) {
    if (error instanceof SSLCommerzError) {
      return NextResponse.json(
        { error: error.message, statusCode: error.statusCode, apiResponse: error.apiResponse },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
