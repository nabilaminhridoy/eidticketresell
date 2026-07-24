import { NextRequest, NextResponse } from 'next/server';
import { createSSLCommerz } from '@/lib/sslcommerz';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Parse IPN data from SSLCommerz
    const formData = await request.formData();
    const ipnData: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      ipnData[key] = String(value);
    }

    console.log('SSLCommerz IPN received:', ipnData);

    // Create SSLCommerz instance for hash verification
    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    // Step 1: Verify the IPN hash for security
    const isHashValid = sslcz.verifyIpnHash(ipnData);
    if (!isHashValid) {
      console.error('SSLCommerz IPN hash verification failed');
      return NextResponse.json(
        { error: 'Invalid IPN hash' },
        { status: 400 }
      );
    }

    const tran_id = ipnData.tran_id;
    const status = ipnData.status;
    const val_id = ipnData.val_id;
    const amount = parseFloat(ipnData.amount || '0');
    const store_amount = parseFloat(ipnData.store_amount || '0');
    const bank_tran_id = ipnData.bank_tran_id;
    const card_type = ipnData.card_type;
    const card_no = ipnData.card_no;
    const card_issuer = ipnData.card_issuer;
    const card_brand = ipnData.card_brand;
    const risk_level = parseInt(ipnData.risk_level || '0');
    const risk_title = ipnData.risk_title;

    // Step 2: Find the PaymentTransaction by tran_id
    const paymentTransaction = await db.paymentTransaction.findUnique({
      where: { tranId: tran_id },
    });

    if (!paymentTransaction) {
      console.error(`PaymentTransaction not found for tran_id: ${tran_id}`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Step 3: Validate that the amount matches
    if (Math.abs(amount - paymentTransaction.amount) > 0.01) {
      console.error(
        `Amount mismatch for tran_id: ${tran_id}. IPN amount: ${amount}, Stored amount: ${paymentTransaction.amount}`
      );
      // Update status to indicate potential fraud
      await db.paymentTransaction.update({
        where: { tranId: tran_id },
        data: {
          status: 'failed',
          paymentStatus: 'failed',
          valId: val_id,
          bankTranId: bank_tran_id,
          cardType: card_type,
          cardNo: card_no,
          cardIssuer: card_issuer,
          cardBrand: card_brand,
          storeAmount: store_amount,
          riskLevel: risk_level,
          riskTitle: risk_title,
        },
      });
      return NextResponse.json(
        { error: 'Amount mismatch - possible fraud detected' },
        { status: 400 }
      );
    }

    // Step 4: Update PaymentTransaction with all IPN data
    const statusMapping: Record<string, { status: string; paymentStatus: string }> = {
      VALID: { status: 'valid', paymentStatus: 'paid' },
      VALIDATED: { status: 'validated', paymentStatus: 'paid' },
      FAILED: { status: 'failed', paymentStatus: 'failed' },
      CANCELLED: { status: 'cancelled', paymentStatus: 'failed' },
      UNATTEMPTED: { status: 'unattempted', paymentStatus: 'pending' },
      EXPIRED: { status: 'expired', paymentStatus: 'pending' },
    };

    const mappedStatus = statusMapping[status] || { status: status.toLowerCase(), paymentStatus: 'pending' };

    await db.paymentTransaction.update({
      where: { tranId: tran_id },
      data: {
        status: mappedStatus.status,
        paymentStatus: mappedStatus.paymentStatus,
        valId: val_id,
        bankTranId: bank_tran_id,
        cardType: card_type,
        cardNo: card_no,
        cardIssuer: card_issuer,
        cardBrand: card_brand,
        storeAmount: store_amount,
        riskLevel: risk_level,
        riskTitle: risk_title,
        currencyType: ipnData.currency_type,
        currencyAmount: parseFloat(ipnData.currency_amount || '0'),
        paidAt: status === 'VALID' || status === 'VALIDATED' ? new Date() : undefined,
        valueA: ipnData.value_a,
        valueB: ipnData.value_b,
        valueC: ipnData.value_c,
        valueD: ipnData.value_d,
      },
    });

    // Step 5: If VALID/VALIDATED and amounts match, update linked Order
    if ((status === 'VALID' || status === 'VALIDATED') && paymentTransaction.orderId) {
      await db.order.update({
        where: { id: paymentTransaction.orderId },
        data: {
          paymentStatus: 'paid',
          escrowStatus: 'held',
        },
      });

      console.log(`Order ${paymentTransaction.orderId} payment confirmed via IPN`);
    }

    // Return 200 OK acknowledgment to SSLCommerz
    return NextResponse.json({ status: 'IPN processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('SSLCommerz IPN processing error:', error);
    // Still return 200 to prevent SSLCommerz from retrying indefinitely
    // but log the error for investigation
    return NextResponse.json(
      { error: 'IPN processing failed, but acknowledged' },
      { status: 200 }
    );
  }
}
