import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, BillPaymentStatusParams } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      transaction_id,
      tran_id,
      stk_code,
      reference_id,
    } = body;

    // Resolve transaction ID
    const resolvedTranId = tran_id || transaction_id;

    if (!token || !stk_code || !resolvedTranId) {
      return NextResponse.json(
        { error: 'Missing required fields: token, stk_code, tran_id (or transaction_id)' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const params: BillPaymentStatusParams = {
      token,
      stk_code,
      tran_id: resolvedTranId,
    };

    const result = await sslcz.getBillPaymentStatus(params);

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Payment status query failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tran_id: result.tran_id,
      bank_tran_id: result.bank_tran_id,
      amount: result.amount,
      payment_date: result.payment_date,
      payment_status: result.payment_status,
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
