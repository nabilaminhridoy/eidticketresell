import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, BillPaymentConfirmParams } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      transaction_id,
      tran_id,
      payment_approval_id,
      stk_code,
      reference_id,
      account_number,
      bill_number,
      amount,
      mobile_no,
      mobile_number,
      reference,
    } = body;

    // Resolve transaction ID
    const resolvedTranId = tran_id || transaction_id;
    const resolvedAccountNumber = account_number || reference_id;

    if (!token || !stk_code || !resolvedAccountNumber || !bill_number || !amount || !resolvedTranId) {
      return NextResponse.json(
        { error: 'Missing required fields: token, stk_code, account_number (or reference_id), bill_number, amount, tran_id (or transaction_id)' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const params: BillPaymentConfirmParams = {
      token,
      stk_code,
      account_number: resolvedAccountNumber,
      bill_number,
      amount,
      tran_id: resolvedTranId,
    };

    if (mobile_no || mobile_number) {
      params.mobile_number = mobile_no || mobile_number;
    }
    if (reference) {
      params.reference = reference;
    }

    const result = await sslcz.confirmBillPayment(params);

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Bill payment confirmation failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tran_id: result.tran_id,
      bank_tran_id: result.bank_tran_id,
      amount: result.amount,
      payment_date: result.payment_date,
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
