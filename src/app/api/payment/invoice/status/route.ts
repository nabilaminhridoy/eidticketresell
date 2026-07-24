import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, InvoiceStatusParams } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refer, invoice_id, inv_id, inv_invoice_number, sessionkey } = body;

    // Accept either invoice_id (from our task spec) or inv_id/inv_invoice_number (from SSLCommerz)
    const resolvedInvId = inv_id || invoice_id;

    if (!resolvedInvId && !inv_invoice_number && !sessionkey) {
      return NextResponse.json(
        { error: 'Missing required fields: provide at least one of invoice_id (inv_id), inv_invoice_number, or sessionkey' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const params: InvoiceStatusParams = {};

    if (resolvedInvId) params.inv_id = resolvedInvId;
    if (inv_invoice_number) params.inv_invoice_number = inv_invoice_number;
    if (sessionkey || refer) params.sessionkey = sessionkey || refer;

    const result = await sslcz.getInvoicePaymentStatus(params);

    if (result.status === 'FAILED' || result.status === 'ERROR') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Invoice payment status query failed', details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      inv_id: result.inv_id,
      inv_invoice_number: result.inv_invoice_number,
      inv_total_amount: result.inv_total_amount,
      inv_currency: result.inv_currency,
      inv_status: result.inv_status,
      tran_id: result.tran_id,
      tran_date: result.tran_date,
      val_id: result.val_id,
      amount: result.amount,
      bank_tran_id: result.bank_tran_id,
      card_type: result.card_type,
      card_no: result.card_no,
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
