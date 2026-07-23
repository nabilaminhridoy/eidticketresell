import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET: Get journey verification status for an order
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
      include: { journeyVerification: true },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyerId !== payload.id && order.sellerId !== payload.id) {
      return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        escrowStatus: order.escrowStatus,
      },
      journeyVerification: order.journeyVerification || null,
      canSubmit: !order.journeyVerification && order.buyerId === payload.id && order.ticket?.ticketType === 'online_copy',
      escrowReleaseTime: order.journeyVerification?.submittedAt
        ? new Date(new Date(order.journeyVerification.submittedAt).getTime() + 12 * 60 * 60 * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error('Journey verification get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Submit journey verification (buyer uploads photo/video/GPS)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const body = await req.json();
    const { orderId, photo, video, gpsLat, gpsLng } = body;

    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { ticket: { select: { ticketType: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyerId !== payload.id) return NextResponse.json({ error: 'Only buyer can submit journey verification' }, { status: 403 });
    if (order.ticket?.ticketType !== 'online_copy') return NextResponse.json({ error: 'Journey verification only required for Online Copy tickets' }, { status: 400 });
    if (order.journeyVerification) return NextResponse.json({ error: 'Journey verification already submitted' }, { status: 400 });

    // Validate GPS data
    if (!gpsLat || !gpsLng) return NextResponse.json({ error: 'GPS location is required. Please enable GPS on your device.' }, { status: 400 });

    // Create journey verification record
    const verification = await db.journeyVerification.create({
      data: {
        orderId,
        buyerId: payload.id,
        photo: photo || null,
        video: video || null,
        gpsLat: parseFloat(gpsLat),
        gpsLng: parseFloat(gpsLng),
        gpsTimestamp: new Date(),
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    // Update order delivery status
    await db.order.update({
      where: { id: orderId },
      data: { deliveryStatus: 'journey_verified' },
    });

    // Calculate escrow release time (12 hours after submission)
    const releaseTime = new Date(new Date().getTime() + 12 * 60 * 60 * 1000);

    // Create notifications
    await db.notification.createMany({
      data: [
        {
          userId: payload.id,
          title: 'Journey Verification Submitted',
          message: `Your journey verification for order ${order.orderId} has been submitted. Escrow will be released to seller after 12 hours (${releaseTime.toLocaleString()}).`,
          type: 'success',
        },
        {
          userId: order.sellerId,
          title: 'Journey Verified by Buyer',
          message: `Buyer verified their journey for order ${order.orderId}. Payment will be released to your wallet in 12 hours.`,
          type: 'info',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      verification,
      escrowReleaseTime: releaseTime.toISOString(),
      message: 'Journey verification submitted successfully. Escrow will be released after 12 hours.',
    });
  } catch (error) {
    console.error('Journey verification submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Admin - Approve or reject journey verification
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    if (payload.role !== 'admin' && payload.role !== 'super_admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { verificationId, action } = body; // action: 'approve' or 'reject'

    if (!verificationId || !action) return NextResponse.json({ error: 'verificationId and action are required' }, { status: 400 });

    const verification = await db.journeyVerification.findUnique({ where: { id: verificationId } });
    if (!verification) return NextResponse.json({ error: 'Verification not found' }, { status: 404 });

    if (action === 'approve') {
      // Immediately release escrow
      const order = await db.order.findUnique({ where: { id: verification.orderId } });
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      await db.$transaction(async (tx) => {
        await tx.journeyVerification.update({
          where: { id: verificationId },
          data: { status: 'verified', verifiedAt: new Date() },
        });

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
              description: `Escrow released for order ${order.orderId} - Journey verified by admin`,
              orderId: order.id,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'completed', escrowStatus: 'released', paymentStatus: 'completed', completedAt: new Date() },
        });
      });

      await db.notification.createMany({
        data: [
          { userId: verification.buyerId, title: 'Journey Verified', message: 'Your journey verification has been approved by admin.', type: 'success' },
          { userId: order.sellerId, title: 'Payment Released!', message: `Escrow for order ${order.orderId} has been released to your wallet.`, type: 'success' },
        ],
      });

      return NextResponse.json({ success: true, message: 'Journey verification approved. Escrow released to seller.' });
    } else if (action === 'reject') {
      await db.journeyVerification.update({
        where: { id: verificationId },
        data: { status: 'rejected', verifiedAt: new Date() },
      });

      await db.notification.create({
        data: { userId: verification.buyerId, title: 'Journey Verification Rejected', message: 'Your journey verification was rejected. Please resubmit or contact support.', type: 'warning' },
      });

      return NextResponse.json({ success: true, message: 'Journey verification rejected.' });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Journey verification admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
