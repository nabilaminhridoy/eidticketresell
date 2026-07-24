import { NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError } from '@/lib/sslcommerz';

export async function GET() {
  try {
    const stkCode = process.env.SSLCOMMERZ_QBP_STK_CODE;
    const authKey = process.env.SSLCOMMERZ_QBP_AUTH_KEY;

    if (!stkCode || !authKey) {
      return NextResponse.json(
        { error: 'Missing environment variables: SSLCOMMERZ_QBP_STK_CODE, SSLCOMMERZ_QBP_AUTH_KEY' },
        { status: 500 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const result = await sslcz.getServiceList(stkCode, authKey);

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Service list query failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      services: result.services,
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
