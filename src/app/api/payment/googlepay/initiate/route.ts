import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError, GooglePayTransactionParams } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      totalAmount,
      currency,
      tranId,
      cusName,
      cusEmail,
      cusPhone,
      cusAdd1,
      cusCity,
      cusPostcode,
      cusCountry,
      product_category,
      product_name,
      product_profile,
      success_url,
      fail_url,
      cancel_url,
      ipn_url,
      value_a,
      value_b,
      value_c,
      value_d,
    } = body;

    // Validate required fields
    if (!totalAmount || !currency || !tranId) {
      return NextResponse.json(
        { error: 'Missing required fields: totalAmount, currency, tranId' },
        { status: 400 }
      );
    }

    if (!cusName || !cusEmail || !cusPhone) {
      return NextResponse.json(
        { error: 'Missing required customer fields: cusName, cusEmail, cusPhone' },
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

    const params: GooglePayTransactionParams = {
      total_amount: totalAmount,
      currency: currency || 'BDT',
      tran_id: tranId,
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

    if (ipn_url || defaultIpnUrl) params.ipn_url = ipn_url || defaultIpnUrl;
    if (product_category) params.product_category = product_category;
    if (product_name) params.product_name = product_name;
    if (product_profile) params.product_profile = product_profile;
    if (value_a) params.value_a = value_a;
    if (value_b) params.value_b = value_b;
    if (value_c) params.value_c = value_c;
    if (value_d) params.value_d = value_d;

    const result = await sslcz.initiateGooglePayTransaction(params);

    if (!result.sessionkey || !result.actionurl) {
      return NextResponse.json(
        { error: result.error || result.reason || result.failedreason || 'Google Pay transaction initiation failed', details: result },
        { status: 400 }
      );
    }

    // Create PaymentTransaction record in database
    const paymentTransaction = await db.paymentTransaction.create({
      data: {
        tranId: tranId,
        amount: typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount,
        currency: currency || 'BDT',
        paymentMethod: 'googlepay',
        status: 'pending',
        paymentStatus: 'pending',
        cusName: cusName,
        cusEmail: cusEmail,
        cusPhone: cusPhone,
        sessionKey: result.sessionkey,
        googlePaySessionKey: result.sessionkey,
        googlePayActionUrl: result.actionurl,
        orderId: orderId || null,
      },
    });

    return NextResponse.json({
      success: true,
      session_key: result.sessionkey,
      actionurl: result.actionurl,
      tran_id: result.tran_id,
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
