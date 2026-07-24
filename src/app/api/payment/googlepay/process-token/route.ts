import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  let parsedSessionKey: string | undefined;

  try {
    const body = await request.json();
    const { session_key, en_signature_data, actionurl } = body;

    parsedSessionKey = session_key;

    if (!session_key || !en_signature_data || !actionurl) {
      return NextResponse.json(
        { error: 'Missing required fields: session_key, en_signature_data, actionurl' },
        { status: 400 }
      );
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const result = await sslcz.processGooglePayToken(
      session_key,
      en_signature_data,
      actionurl
    );

    // Find the existing PaymentTransaction by session key
    const paymentTransaction = await db.paymentTransaction.findFirst({
      where: { googlePaySessionKey: session_key },
    });

    if (result.status === 'SUCCESS' || result.status === '200') {
      // Update the payment transaction record with validation data
      if (paymentTransaction) {
        await db.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: {
            status: 'valid',
            paymentStatus: 'paid',
            valId: result.val_id || null,
            bankTranId: result.bank_tran_id || null,
            cardType: result.card_type || null,
            cardNo: result.card_no || null,
            validatedAt: new Date(),
            paidAt: new Date(),
          },
        });
      }

      // Check if 3DS verification is required (OTP page)
      // The response may include a redirect URL for OTP verification
      if (result.reason && result.reason.toLowerCase().includes('3ds')) {
        return NextResponse.json({
          success: true,
          type: 'otp',
          redirectUrl: result.reason,
          val_id: result.val_id,
          tran_id: result.tran_id,
          amount: result.amount,
          bank_tran_id: result.bank_tran_id,
        });
      }

      // Direct successful transaction (regular type)
      return NextResponse.json({
        success: true,
        type: 'regular',
        val_id: result.val_id,
        tran_id: result.tran_id,
        amount: result.amount,
        bank_tran_id: result.bank_tran_id,
        card_type: result.card_type,
        card_no: result.card_no,
        validated_on: result.validated_on,
      });
    }

    // Transaction failed or requires 3DS
    // Check if it's a 3DS/OTP redirect scenario
    if (result.message && result.message.includes('redirect')) {
      // OTP/3DS verification required
      const redirectUrl = result.message;

      if (paymentTransaction) {
        await db.paymentTransaction.update({
          where: { id: paymentTransaction.id },
          data: {
            status: 'pending',
            paymentStatus: 'pending',
          },
        });
      }

      return NextResponse.json({
        success: true,
        type: 'otp',
        redirectUrl,
        message: result.message,
      });
    }

    // Transaction processing failed
    if (paymentTransaction) {
      await db.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: {
          status: 'failed',
          paymentStatus: 'failed',
        },
      });
    }

    return NextResponse.json(
      { error: result.error || result.reason || result.message || 'Google Pay token processing failed', details: result },
      { status: 400 }
    );
  } catch (error) {
    // Try to update the payment transaction status on error
    if (parsedSessionKey) {
      try {
        const paymentTransaction = await db.paymentTransaction.findFirst({
          where: { googlePaySessionKey: parsedSessionKey },
        });
        if (paymentTransaction) {
          await db.paymentTransaction.update({
            where: { id: paymentTransaction.id },
            data: { status: 'failed', paymentStatus: 'failed' },
          });
        }
      } catch {
        // Ignore update errors during error handling
      }
    }

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
