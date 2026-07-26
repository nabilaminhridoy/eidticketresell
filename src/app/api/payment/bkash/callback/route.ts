import { NextRequest, NextResponse } from 'next/server';
import { getBkashService } from '@/lib/bkash';
import { db } from '@/lib/db';

/**
 * bKash Callback Handler
 *
 * This is the URL that bKash redirects the customer back to after payment/agreement.
 * The callback URL format from bKash:
 *   {callbackURL}?paymentID=xxx&status=xxx&trxID=xxx&amount=xxx
 *
 * This route:
 * - Extracts paymentID, status, trxID from query params
 * - Verifies the payment/agreement status by calling bKash API
 * - Updates the BkashTransaction in the database
 * - Updates the Order payment status if linked
 * - Redirects the user to the frontend with success/failure status
 */
export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleCallback(request);
}

async function handleCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract callback parameters from bKash
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');
    const trxID = searchParams.get('trxID');
    const amount = searchParams.get('amount');

    if (!paymentID) {
      console.error('bKash callback: missing paymentID parameter');
      return NextResponse.redirect(
        new URL('/?bkash=error&reason=missing_payment_id', request.url)
      );
    }

    console.log(`bKash callback received: paymentID=${paymentID}, status=${status}, trxID=${trxID}`);

    // Find the existing BkashTransaction by paymentID
    const bkashTxn = await db.bkashTransaction.findFirst({
      where: { paymentId: paymentID },
    });

    if (!bkashTxn) {
      console.error(`bKash callback: BkashTransaction not found for paymentID: ${paymentID}`);
      return NextResponse.redirect(
        new URL('/?bkash=error&reason=transaction_not_found', request.url)
      );
    }

    const bkash = getBkashService();

    // Determine if this is an agreement (mode 0000) or payment (mode 0001) callback
    if (bkashTxn.agreementMode === '0000' && bkashTxn.operationType === 'agreement_create') {
      // Handle agreement callback
      if (status === 'success') {
        try {
          // Execute the agreement to get the agreementID
          const executeResult = await bkash.executeAgreement({ paymentID });

          await db.bkashTransaction.update({
            where: { id: bkashTxn.id },
            data: {
              agreementId: executeResult.agreementID,
              trxId: executeResult.trxId,
              statusCode: executeResult.statusCode,
              statusMessage: executeResult.statusMessage,
              rawResponse: JSON.stringify(executeResult),
              status: 'completed',
              agreementStatus: 'Completed',
            },
          });

          // Redirect to frontend with success
          return NextResponse.redirect(
            new URL(`/?bkash=agreement_success&agreementID=${executeResult.agreementID}&paymentID=${paymentID}`, request.url)
          );
        } catch (execError) {
          console.error('bKash callback: agreement execution failed:', execError);

          await db.bkashTransaction.update({
            where: { id: bkashTxn.id },
            data: {
              statusCode: '2046',
              statusMessage: 'Agreement execution failed',
              rawResponse: JSON.stringify({ callbackStatus: status, error: execError instanceof Error ? execError.message : 'Unknown' }),
              status: 'failed',
              agreementStatus: 'Failed',
            },
          });

          return NextResponse.redirect(
            new URL(`/?bkash=agreement_failed&paymentID=${paymentID}`, request.url)
          );
        }
      } else {
        // Agreement was cancelled or failed by the customer
        await db.bkashTransaction.update({
          where: { id: bkashTxn.id },
          data: {
            statusCode: status === 'cancel' ? '2065' : '2044',
            statusMessage: `Agreement ${status} by customer`,
            rawResponse: JSON.stringify({ paymentID, status, trxID, amount }),
            status: status === 'cancel' ? 'cancelled' : 'failed',
            agreementStatus: status === 'cancel' ? 'Cancelled' : 'Failed',
          },
        });

        return NextResponse.redirect(
          new URL(`/?bkash=agreement_${status}&paymentID=${paymentID}`, request.url)
        );
      }
    } else {
      // Handle payment callback (mode 0001)
      if (status === 'success') {
        try {
          // Verify payment by querying the payment status from bKash
          const paymentStatus = await bkash.queryPaymentStatus({ paymentID });

          // Verify amount matches
          const callbackAmount = parseFloat(amount || '0');
          const storedAmount = bkashTxn.amount || 0;
          const apiAmount = parseFloat(paymentStatus.amount || '0');

          const amountVerified = Math.abs(apiAmount - storedAmount) <= 0.01;

          if (paymentStatus.statusCode === '0000' && amountVerified) {
            // Payment verified successfully
            await db.bkashTransaction.update({
              where: { id: bkashTxn.id },
              data: {
                trxId: paymentStatus.trxId,
                statusCode: paymentStatus.statusCode,
                statusMessage: paymentStatus.statusMessage,
                payerReference: paymentStatus.payerReference || bkashTxn.payerReference,
                rawResponse: JSON.stringify(paymentStatus),
                status: 'completed',
              },
            });

            // Update linked Order if applicable
            if (bkashTxn.orderId) {
              await db.order.update({
                where: { id: bkashTxn.orderId },
                data: {
                  paymentStatus: 'paid',
                  escrowStatus: 'held',
                },
              });
            }

            console.log(`bKash payment verified successfully: paymentID=${paymentID}, trxID=${paymentStatus.trxId}`);

            return NextResponse.redirect(
              new URL(`/?bkash=payment_success&paymentID=${paymentID}&trxID=${paymentStatus.trxId}&amount=${paymentStatus.amount}`, request.url)
            );
          } else {
            // Payment verification failed (amount mismatch or not completed)
            console.error(
              `bKash payment verification failed: paymentID=${paymentID}, ` +
              `apiStatus=${paymentStatus.statusCode}, apiAmount=${paymentStatus.amount}, storedAmount=${storedAmount}`
            );

            await db.bkashTransaction.update({
              where: { id: bkashTxn.id },
              data: {
                trxId: paymentStatus.trxId,
                statusCode: paymentStatus.statusCode,
                statusMessage: paymentStatus.statusMessage,
                rawResponse: JSON.stringify(paymentStatus),
                status: 'failed',
              },
            });

            // Mark order payment as failed
            if (bkashTxn.orderId) {
              await db.order.update({
                where: { id: bkashTxn.orderId },
                data: {
                  paymentStatus: 'failed',
                },
              });
            }

            return NextResponse.redirect(
              new URL(`/?bkash=payment_verification_failed&paymentID=${paymentID}`, request.url)
            );
          }
        } catch (verifyError) {
          console.error('bKash callback: payment verification error:', verifyError);

          await db.bkashTransaction.update({
            where: { id: bkashTxn.id },
            data: {
              rawResponse: JSON.stringify({
                callbackParams: { paymentID, status, trxID, amount },
                verificationError: verifyError instanceof Error ? verifyError.message : 'Unknown',
              }),
              status: 'pending', // Keep pending since we couldn't verify
            },
          });

          return NextResponse.redirect(
            new URL(`/?bkash=payment_verify_error&paymentID=${paymentID}`, request.url)
          );
        }
      } else {
        // Payment was cancelled or failed by the customer
        await db.bkashTransaction.update({
          where: { id: bkashTxn.id },
          data: {
            trxId: trxID || null,
            statusCode: status === 'cancel' ? '2065' : '2043',
            statusMessage: `Payment ${status} by customer`,
            rawResponse: JSON.stringify({ paymentID, status, trxID, amount }),
            status: status === 'cancel' ? 'cancelled' : 'failed',
          },
        });

        // Mark order payment as failed
        if (bkashTxn.orderId) {
          await db.order.update({
            where: { id: bkashTxn.orderId },
            data: {
              paymentStatus: 'failed',
            },
          });
        }

        return NextResponse.redirect(
          new URL(`/?bkash=payment_${status}&paymentID=${paymentID}`, request.url)
        );
      }
    }
  } catch (error) {
    console.error('bKash callback handler error:', error);
    return NextResponse.redirect(
      new URL('/?bkash=error&reason=internal_error', request.url)
    );
  }
}
