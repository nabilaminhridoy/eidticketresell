import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionkey = searchParams.get('sessionkey');
    const tran_id = searchParams.get('tran_id');

    if (!sessionkey && !tran_id) {
      return NextResponse.json(
        { error: 'Either sessionkey or tran_id parameter is required' },
        { status: 400 }
      );
    }

    // Query our database first
    let paymentTransaction = null;

    if (tran_id) {
      paymentTransaction = await db.paymentTransaction.findUnique({
        where: { tranId: tran_id },
        include: { order: true },
      });
    } else if (sessionkey) {
      paymentTransaction = await db.paymentTransaction.findFirst({
        where: { sessionKey: sessionkey },
        include: { order: true },
      });
    }

    if (!paymentTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found in database' },
        { status: 404 }
      );
    }

    // Create SSLCommerz instance
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Query SSLCommerz API for transaction details
    let sslcommerzData = null;

    try {
      if (sessionkey || paymentTransaction.sessionKey) {
        sslcommerzData = await sslcz.queryTransactionBySession(
          sessionkey || paymentTransaction.sessionKey!
        );
      } else if (tran_id) {
        sslcommerzData = await sslcz.queryTransactionByTranId(tran_id);
      }
    } catch (error) {
      console.error('SSLCommerz transaction query API error:', error);
      // Continue even if SSLCommerz API fails - still return database data
    }

    return NextResponse.json({
      status: 'success',
      database: paymentTransaction,
      sslcommerz: sslcommerzData,
    });
  } catch (error) {
    console.error('SSLCommerz transaction query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Transaction query failed', details: message },
      { status: 500 }
    );
  }
}
