import { NextRequest, NextResponse } from 'next/server';
import { getBkashService } from '@/lib/bkash';
import { db } from '@/lib/db';
import { generatePrefixedId } from '@/lib/id-prefix';

/**
 * bKash Webhook / IPN Handler
 *
 * Handles:
 * 1. Amazon SNS SubscriptionConfirmation - bKash uses SNS for IPN delivery
 * 2. Actual payment notification payloads
 *
 * Returns 200 quickly to acknowledge receipt, then processes asynchronously.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle Amazon SNS SubscriptionConfirmation
    if (body.Type === 'SubscriptionConfirmation') {
      console.log('bKash SNS SubscriptionConfirmation received:', {
        TopicArn: body.TopicArn,
        SubscribeURL: body.SubscribeURL,
        Token: body.Token,
      });

      // Confirm the subscription by visiting the SubscribeURL
      // In production, you would fetch the SubscribeURL to confirm
      // For now, log it for manual confirmation or auto-confirm
      // SSRF protection: Validate SubscribeURL belongs to Amazon SNS
      try {
        if (body.SubscribeURL && typeof body.SubscribeURL === 'string') {
          const snsUrl = new URL(body.SubscribeURL);
          if (snsUrl.protocol === 'https:' && snsUrl.hostname.endsWith('.amazonaws.com')) {
            const confirmResponse = await fetch(snsUrl.toString());
            console.log('SNS subscription confirmed:', confirmResponse.status);
          } else {
            console.error('SNS SubscribeURL rejected: domain not allowed:', snsUrl.hostname);
          }
        }
      } catch (confirmError) {
        console.error('SNS subscription confirmation failed:', confirmError);
      }

      // Return 200 quickly to acknowledge
      return NextResponse.json({ status: 'SNS subscription confirmed' }, { status: 200 });
    }

    // Handle actual payment notification (SNS notification with payment data)
    if (body.Type === 'Notification') {
      console.log('bKash SNS Notification received:', {
        TopicArn: body.TopicArn,
        Subject: body.Subject,
      });

      // Parse the payment notification message
      let paymentData: Record<string, unknown>;
      try {
        paymentData = typeof body.Message === 'string' ? JSON.parse(body.Message) : body.Message;
      } catch {
        paymentData = { rawMessage: body.Message };
      }

      console.log('bKash payment notification data:', paymentData);

      // Process the payment notification asynchronously
      // Return 200 immediately to prevent retries
      processPaymentNotification(paymentData).catch((err) => {
        console.error('bKash webhook: async payment notification processing error:', err);
      });

      return NextResponse.json({ status: 'Notification acknowledged' }, { status: 200 });
    }

    // Handle direct notification (non-SNS format)
    // Some bKash implementations may send notifications directly
    console.log('bKash direct notification received:', body);

    const paymentID = body.paymentID || body.paymentId;
    const trxID = body.trxID || body.trxId;
    const amount = body.amount;
    const statusCode = body.statusCode || body.status;

    if (paymentID) {
      // Find existing BkashTransaction
      const bkashTxn = await db.bkashTransaction.findFirst({
        where: { paymentId: paymentID },
      });

      if (bkashTxn) {
        const isSuccess = statusCode === '0000' || statusCode === 'success';
        await db.bkashTransaction.update({
          where: { id: bkashTxn.id },
          data: {
            trxId: trxID || bkashTxn.trxId,
            statusCode: String(statusCode),
            statusMessage: body.statusMessage || null,
            rawResponse: JSON.stringify(body),
            status: isSuccess ? 'completed' : 'failed',
          },
        });

        // Update linked Order if payment successful
        if (isSuccess && bkashTxn.orderId) {
          await db.order.update({
            where: { id: bkashTxn.orderId },
            data: {
              paymentStatus: 'paid',
              escrowStatus: 'held',
            },
          });
        }
      } else {
        // Create a tracking record for unknown payment notification
        const bkashId = await generatePrefixedId('BKASH');
        await db.bkashTransaction.create({
          data: {
            bkashId,
            operationType: 'payment_status',
            paymentId: paymentID,
            trxId: trxID || null,
            amount: amount ? parseFloat(String(amount)) : null,
            statusCode: String(statusCode),
            statusMessage: body.statusMessage || null,
            rawResponse: JSON.stringify(body),
            status: statusCode === '0000' || statusCode === 'success' ? 'completed' : 'failed',
          },
        });
      }
    }

    return NextResponse.json({ status: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('bKash webhook handler error:', error);
    // Always return 200 to prevent bKash/SNS from retrying indefinitely
    return NextResponse.json(
      { error: 'Webhook processing failed, but acknowledged' },
      { status: 200 }
    );
  }
}

/**
 * Process payment notification data asynchronously
 * This verifies the payment with bKash API and updates the database
 */
async function processPaymentNotification(paymentData: Record<string, unknown>) {
  const paymentID = paymentData.paymentID || paymentData.paymentId;

  if (!paymentID) {
    console.error('bKash webhook: no paymentID in notification data');
    return;
  }

  try {
    const bkash = getBkashService();

    // Verify the payment by querying bKash status API
    const paymentStatus = await bkash.queryPaymentStatus({
      paymentID: String(paymentID),
    });

    // Find existing BkashTransaction
    const bkashTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: String(paymentID) },
    });

    if (bkashTxn) {
      const isSuccess = paymentStatus.statusCode === '0000';
      const apiAmount = parseFloat(paymentStatus.amount || '0');
      const storedAmount = bkashTxn.amount || 0;
      const amountVerified = Math.abs(apiAmount - storedAmount) <= 0.01;

      await db.bkashTransaction.update({
        where: { id: bkashTxn.id },
        data: {
          trxId: paymentStatus.trxId,
          statusCode: paymentStatus.statusCode,
          statusMessage: paymentStatus.statusMessage,
          payerReference: paymentStatus.payerReference || bkashTxn.payerReference,
          rawResponse: JSON.stringify({
            webhook: paymentData,
            verification: paymentStatus,
          }),
          status: isSuccess && amountVerified ? 'completed' : 'failed',
        },
      });

      // Update linked Order if payment verified
      if (isSuccess && amountVerified && bkashTxn.orderId) {
        await db.order.update({
          where: { id: bkashTxn.orderId },
          data: {
            paymentStatus: 'paid',
            escrowStatus: 'held',
          },
        });
        console.log(`bKash webhook: Order ${bkashTxn.orderId} payment confirmed via IPN`);
      }
    } else {
      // Create a tracking record for unknown payment
      const bkashId = await generatePrefixedId('BKASH');
      await db.bkashTransaction.create({
        data: {
          bkashId,
          operationType: 'payment_status',
          paymentId: String(paymentID),
          trxId: paymentStatus.trxId,
          amount: parseFloat(paymentStatus.amount || '0'),
          statusCode: paymentStatus.statusCode,
          statusMessage: paymentStatus.statusMessage,
          payerReference: paymentStatus.payerReference || null,
          rawResponse: JSON.stringify({
            webhook: paymentData,
            verification: paymentStatus,
          }),
          status: paymentStatus.statusCode === '0000' ? 'completed' : 'failed',
        },
      });
    }
  } catch (verifyError) {
    console.error('bKash webhook: payment verification via API failed:', verifyError);
  }
}
