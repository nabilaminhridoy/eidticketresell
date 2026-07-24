import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, CreateInvoiceParams } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      totalAmount,
      currency,
      tranId,
      product_category,
      cusName,
      cusEmail,
      cusPhone,
      cusAdd1,
      cusCity,
      cusPostcode,
      cusCountry,
      success_url,
      fail_url,
      cancel_url,
      ipn_url,
      product_name,
      product_profile,
      inv_id,
      inv_name,
      inv_description,
      inv_currency,
      inv_due_date,
      inv_billing_period,
      inv_billing_cycle,
      value_a,
      value_b,
      value_c,
      value_d,
    } = body;

    // Validate required fields
    if (!totalAmount || !cusName || !cusEmail || !cusPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: totalAmount, cusName, cusEmail, cusPhone' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Build default URLs from env vars if not provided
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const defaultSuccessUrl = `${baseUrl}/api/payment/success`;
    const defaultFailUrl = `${baseUrl}/api/payment/fail`;
    const defaultCancelUrl = `${baseUrl}/api/payment/cancel`;
    const defaultIpnUrl = `${baseUrl}/api/payment/ipn`;

    // Generate a tranId if not provided
    const resolvedTranId = tranId || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const params: CreateInvoiceParams = {
      inv_total_amount: totalAmount,
      cus_name: cusName,
      cus_email: cusEmail,
      cus_add1: cusAdd1 || 'N/A',
      cus_city: cusCity || 'Dhaka',
      cus_postcode: cusPostcode || '1000',
      cus_country: cusCountry || 'BD',
      cus_phone: cusPhone,
      success_url: success_url || defaultSuccessUrl,
      fail_url: fail_url || defaultFailUrl,
      cancel_url: cancel_url || defaultCancelUrl,
    };

    // Add optional fields
    if (inv_id) params.inv_id = inv_id;
    if (inv_name) params.inv_name = inv_name;
    if (inv_description) params.inv_description = inv_description;
    if (inv_currency || currency) params.inv_currency = inv_currency || currency || 'BDT';
    if (inv_due_date) params.inv_due_date = inv_due_date;
    if (inv_billing_period) params.inv_billing_period = inv_billing_period;
    if (inv_billing_cycle) params.inv_billing_cycle = inv_billing_cycle;
    if (ipn_url || defaultIpnUrl) params.ipn_url = ipn_url || defaultIpnUrl;
    if (product_name) params.product_name = product_name;
    if (product_profile) params.product_profile = product_profile;
    if (product_category) params.product_category = product_category;
    if (value_a) params.value_a = value_a;
    if (value_b) params.value_b = value_b;
    if (value_c) params.value_c = value_c;
    if (value_d) params.value_d = value_d;

    const result = await sslcz.createInvoice(params);

    if (result.status === 'FAILED' || result.status === 'ERROR' || !result.pay_url) {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Invoice creation failed', details: result },
        { status: 400 }
      );
    }

    // Create PaymentTransaction record in database with invoice fields
    const paymentTransaction = await db.paymentTransaction.create({
      data: {
        tranId: resolvedTranId,
        amount: typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount,
        currency: currency || 'BDT',
        paymentMethod: 'sslcommerz',
        status: 'pending',
        paymentStatus: 'pending',
        cusName: cusName,
        cusEmail: cusEmail,
        cusPhone: cusPhone,
        cusAdd1: cusAdd1 || null,
        cusCity: cusCity || null,
        cusCountry: cusCountry || null,
        // Invoice-specific fields
        invoiceId: result.invoice_id || result.inv_id || null,
        payUrl: result.pay_url || null,
        qrPayUrl: result.qr_image_pay_url || null,
        banglaQrCode: result.bangla_qr_code || null,
      },
    });

    return NextResponse.json({
      success: true,
      pay_url: result.pay_url,
      qr_image_pay_url: result.qr_image_pay_url,
      invoice_id: result.invoice_id || result.inv_id,
      bangla_qr_code: result.bangla_qr_code,
      tran_id: resolvedTranId,
      paymentTransactionId: paymentTransaction.id,
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
