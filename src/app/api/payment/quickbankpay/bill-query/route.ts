import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, BillQueryParams } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      service_type,
      stk_code,
      reference_id,
      account_number,
      mobile_no,
      mobile_number,
      dob,
      bill_month,
      amount,
      reference,
    } = body;

    // Either stk_code or service_type must be provided
    const resolvedStkCode = stk_code || service_type;
    if (!token || !resolvedStkCode) {
      return NextResponse.json(
        { error: 'Missing required fields: token, stk_code (or service_type)' },
        { status: 400 }
      );
    }

    // account_number or reference_id is needed to identify the bill
    const resolvedAccountNumber = account_number || reference_id;
    if (!resolvedAccountNumber) {
      return NextResponse.json(
        { error: 'Missing required field: account_number (or reference_id)' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const params: BillQueryParams = {
      token,
      stk_code: resolvedStkCode,
      account_number: resolvedAccountNumber,
    };

    if (mobile_no || mobile_number) {
      params.mobile_number = mobile_no || mobile_number;
    }
    if (amount) {
      params.amount = amount;
    }
    if (reference) {
      params.reference = reference;
    }

    const result = await sslcz.queryBill(params);

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Bill query failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bill_number: result.bill_number,
      bill_amount: result.bill_amount,
      bill_due_date: result.bill_due_date,
      bill_minimum_payment: result.bill_minimum_payment,
      bill_customer_name: result.bill_customer_name,
      bill_cycle: result.bill_cycle,
      bill_data: result.bill_data,
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
