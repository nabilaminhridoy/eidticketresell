import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, InvoiceCancelParams } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

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

    const params: InvoiceCancelParams = {};

    if (resolvedInvId) params.inv_id = resolvedInvId;
    if (inv_invoice_number) params.inv_invoice_number = inv_invoice_number;
    if (sessionkey || refer) params.sessionkey = sessionkey || refer;

    const result = await sslcz.cancelInvoice(params);

    if (result.status === 'FAILED' || result.status === 'ERROR') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Invoice cancellation failed', details: result },
        { status: 400 }
      );
    }

    // Update the PaymentTransaction in database if invoice_id is provided
    if (resolvedInvId) {
      const paymentTransaction = await db.paymentTransaction.findUnique({
        where: { invoiceId: resolvedInvId },
      });

      if (paymentTransaction) {
        await db.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: {
            status: 'cancelled',
            paymentStatus: 'cancelled',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      inv_id: result.inv_id,
      inv_invoice_number: result.inv_invoice_number,
      cancel_status: result.cancel_status,
      cancel_date: result.cancel_date,
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
