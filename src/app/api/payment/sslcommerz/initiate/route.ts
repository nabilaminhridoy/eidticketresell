import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'orderId', 'totalAmount', 'currency', 'cusName', 'cusEmail',
      'cusAdd1', 'cusCity', 'cusPostcode', 'cusCountry', 'cusPhone',
      'product_category', 'product_profile',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create SSLCommerz instance
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Generate unique transaction ID
    const tran_id = `ETR-${body.orderId}-${Date.now()}`;

    // Build callback URLs using request origin
    const origin = new URL(request.url).origin;
    const success_url = `${origin}/api/payment/sslcommerz/success`;
    const fail_url = `${origin}/api/payment/sslcommerz/fail`;
    const cancel_url = `${origin}/api/payment/sslcommerz/cancel`;
    const ipn_url = `${origin}/api/payment/sslcommerz/ipn`;

    // Prepare payment parameters
    const paymentParams = {
      total_amount: String(body.totalAmount),
      currency: body.currency,
      tran_id,
      product_category: body.product_category,
      success_url,
      fail_url,
      cancel_url,
      ipn_url,
      cus_name: body.cusName,
      cus_email: body.cusEmail,
      cus_add1: body.cusAdd1,
      cus_city: body.cusCity,
      cus_postcode: body.cusPostcode,
      cus_country: body.cusCountry,
      cus_phone: body.cusPhone,
      product_name: body.product_name || body.product_category,
      product_profile: body.product_profile,
      value_a: body.orderId, // Store orderId in value_a for reference in callbacks
    };

    // Initiate payment with SSLCommerz
    const session = await sslcz.initiatePayment(paymentParams);

    if (!session.sessionkey || !session.GatewayPageURL) {
      return NextResponse.json(
        { error: 'Failed to create payment session', details: session.failedreason },
        { status: 500 }
      );
    }

    // Generate prefixed ID for PaymentTransaction
    const payId = await generatePrefixedId('PAY');

    // Create PaymentTransaction record in database
    const paymentTransaction = await db.paymentTransaction.create({
      data: {
        payId,
        orderId: body.orderId,
        tranId: tran_id,
        sessionKey: session.sessionkey,
        amount: parseFloat(String(body.totalAmount)),
        currency: body.currency,
        cusName: body.cusName,
        cusEmail: body.cusEmail,
        cusPhone: body.cusPhone,
        cusAdd1: body.cusAdd1,
        cusCity: body.cusCity,
        cusCountry: body.cusCountry,
        paymentMethod: 'sslcommerz',
        status: 'pending',
        paymentStatus: 'pending',
        valueA: body.orderId,
      },
    });

    // Return response for both Easy Checkout and Hosted modes
    return NextResponse.json({
      status: 'success',
      data: session.GatewayPageURL,
      sessionkey: session.sessionkey,
      tran_id,
      payId: paymentTransaction.payId,
      logo: process.env.SSLCOMMERZ_STORE_LOGO || '',
      easyCheckoutJsUrl: sslcz.getEasyCheckoutJsUrl(),
    });
  } catch (error) {
    console.error('SSLCommerz initiate payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Payment initiation failed', details: message },
      { status: 500 }
    );
  }
}
