import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import QRCode from 'qrcode';

// GET: Generate QR code image for an order (seller generates)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { ticket: { select: { ticketType: true, ticketId: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.sellerId !== payload.id) return NextResponse.json({ error: 'Only seller can generate QR code' }, { status: 403 });
    if (order.isQrScanned) return NextResponse.json({ error: 'QR code already scanned - order delivery confirmed' }, { status: 400 });

    // Generate QR code data string
    const qrData = order.qrCode || `ETR-VERIFY:${order.ticket?.ticketId || ''}:${order.orderId}`;

    // Generate QR code as base64 PNG image
    const qrImageBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });

    return NextResponse.json({
      qrData,
      qrImageBase64,
      orderId: order.orderId,
      deliveryMethod: order.deliveryMethod,
      deliveryStatus: order.deliveryStatus,
    });
  } catch (error) {
    console.error('QR generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Verify/Scan QR code (buyer scans)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const body = await req.json();
    const { qrData } = body;
    if (!qrData) return NextResponse.json({ error: 'qrData is required' }, { status: 400 });

    // Parse QR data: ETR-VERIFY:{ticketId}:{orderId}
    const parts = qrData.split(':');
    if (parts[0] !== 'ETR-VERIFY' || parts.length < 3) {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 });
    }

    const ticketId = parts[1];
    const orderId = parts[2];

    // Find the order
    const order = await db.order.findFirst({
      where: { orderId, ticket: { ticketId } },
      include: {
        ticket: { select: { ticketType: true, ticketId: true, price: true } },
        seller: { select: { id: true, name: true, username: true } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found for this QR code' }, { status: 404 });
    if (order.buyerId !== payload.id) return NextResponse.json({ error: 'Only the buyer can verify this QR code' }, { status: 403 });
    if (order.isQrScanned) return NextResponse.json({ error: 'QR code already scanned' }, { status: 400 });
    if (order.status === 'completed') return NextResponse.json({ error: 'Order already completed' }, { status: 400 });

    // Mark QR as scanned and complete delivery
    const updatedOrder = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          isQrScanned: true,
          deliveryStatus: 'confirmed',
          completedAt: new Date(),
        },
      });

      // Release escrow to seller for online_copy
      if (order.ticket?.ticketType === 'online_copy') {
        const sellerWallet = await tx.wallet.findUnique({ where: { userId: order.sellerId } });
        if (sellerWallet) {
          await tx.wallet.update({
            where: { userId: order.sellerId },
            data: {
              balance: { increment: order.amount },
              escrowBalance: { decrement: order.amount },
            },
          });
          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              type: 'escrow_release',
              amount: order.amount,
              balance: sellerWallet.balance + order.amount,
              description: `Escrow released for order ${order.orderId} - QR verified`,
              orderId: order.id,
            },
          });
        }
        // Update order status to completed
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'completed', escrowStatus: 'released', paymentStatus: 'completed' },
        });
      } else {
        // For counter_copy: just mark order as completed
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'completed' },
        });
      }

      return updated;
    });

    // Create notifications
    await db.notification.createMany({
      data: [
        {
          userId: payload.id,
          title: 'Delivery Confirmed!',
          message: `QR code verified for order ${order.orderId}. Delivery confirmed!`,
          type: 'success',
        },
        {
          userId: order.sellerId,
          title: 'Payment Received!',
          message: `Buyer confirmed delivery for order ${order.orderId}. ${order.ticket?.ticketType === 'online_copy' ? 'Escrow released to your wallet!' : 'Order completed!'}`,
          type: 'success',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'QR code verified successfully! Delivery confirmed.',
    });
  } catch (error) {
    console.error('QR verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
