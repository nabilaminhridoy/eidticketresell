import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const kyc = await db.kyc.findUnique({
      where: { userId: payload.id as string },
    });

    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: { isKycVerified: true },
    });

    return NextResponse.json({
      kyc: kyc
        ? {
            id: kyc.id,
            documentType: kyc.documentType,
            documentNumber: kyc.documentNumber,
            documentFront: kyc.documentFront,
            documentBack: kyc.documentBack,
            selfiePhoto: kyc.selfiePhoto,
            status: kyc.status,
            submittedAt: kyc.submittedAt,
            reviewedAt: kyc.reviewedAt,
            reviewNote: kyc.reviewNote,
          }
        : null,
      isKycVerified: user?.isKycVerified || false,
    });
  } catch (error) {
    console.error('Get KYC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      documentType,
      documentNumber,
      documentFront,
      documentBack,
      selfiePhoto,
      gpsLatitude,
      gpsLongitude,
    } = body;

    // Validate required fields
    if (!documentType || !documentNumber || !documentFront || !selfiePhoto) {
      return NextResponse.json(
        { error: 'documentType, documentNumber, documentFront, and selfiePhoto are required' },
        { status: 400 }
      );
    }

    if (!['nid', 'driving_licence', 'passport'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type. Must be: nid, driving_licence, or passport' },
        { status: 400 }
      );
    }

    // Check if user already has a KYC submission
    const existingKyc = await db.kyc.findUnique({
      where: { userId: payload.id as string },
    });

    if (existingKyc) {
      if (existingKyc.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending KYC application' },
          { status: 409 }
        );
      }
      if (existingKyc.status === 'approved') {
        return NextResponse.json(
          { error: 'Your KYC has already been approved' },
          { status: 409 }
        );
      }
      // If rejected, allow resubmission by updating
      const updatedKyc = await db.kyc.update({
        where: { userId: payload.id as string },
        data: {
          documentType,
          documentNumber,
          documentFront,
          documentBack: documentBack || null,
          selfiePhoto,
          gpsLatitude: gpsLatitude || null,
          gpsLongitude: gpsLongitude || null,
          status: 'pending',
          reviewedBy: null,
          reviewNote: null,
          reviewedAt: null,
          submittedAt: new Date(),
        },
      });

      await db.notification.create({
        data: {
          userId: payload.id as string,
          title: 'KYC Resubmitted',
          message: 'Your KYC documents have been resubmitted for review. We will notify you once reviewed.',
          type: 'info',
        },
      });

      return NextResponse.json({ kyc: updatedKyc }, { status: 200 });
    }

    // Create new KYC submission
    const kyc = await db.kyc.create({
      data: {
        userId: payload.id as string,
        documentType,
        documentNumber,
        documentFront,
        documentBack: documentBack || null,
        selfiePhoto,
        gpsLatitude: gpsLatitude || null,
        gpsLongitude: gpsLongitude || null,
        status: 'pending',
      },
    });

    await db.notification.create({
      data: {
        userId: payload.id as string,
        title: 'KYC Submitted',
        message: 'Your KYC documents have been submitted for review. We will notify you once reviewed.',
        type: 'info',
      },
    });

    return NextResponse.json({ kyc }, { status: 201 });
  } catch (error) {
    console.error('Submit KYC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
