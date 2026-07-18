import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// NID must be 10, 13, or 17 digits
function isValidNid(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  return [10, 13, 17].includes(digits.length);
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const kyc = await db.kyc.findUnique({
      where: { userId: payload.id as string },
    });

    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: { isKycVerified: true, name: true, dateOfBirth: true, gender: true },
    });

    return NextResponse.json({
      kyc: kyc
        ? {
            id: kyc.id,
            kycName: kyc.kycName,
            kycDob: kyc.kycDob,
            kycGender: kyc.kycGender,
            nameChanged: kyc.nameChanged,
            dobChanged: kyc.dobChanged,
            genderChanged: kyc.genderChanged,
            documentType: kyc.documentType,
            documentNumber: kyc.documentNumber,
            documentFront: kyc.documentFront,
            documentBack: kyc.documentBack,
            selfiePhoto: kyc.selfiePhoto,
            selfieRight: kyc.selfieRight,
            selfieLeft: kyc.selfieLeft,
            selfieSmile: kyc.selfieSmile,
            selfieBlink: kyc.selfieBlink,
            houseRoadVillage: kyc.houseRoadVillage,
            upazilaThana: kyc.upazilaThana,
            district: kyc.district,
            division: kyc.division,
            postalCode: kyc.postalCode,
            gpsLatitude: kyc.gpsLatitude,
            gpsLongitude: kyc.gpsLongitude,
            status: kyc.status,
            submittedAt: kyc.submittedAt,
            reviewedAt: kyc.reviewedAt,
            reviewNote: kyc.reviewNote,
          }
        : null,
      isKycVerified: user?.isKycVerified || false,
      profileName: user?.name,
      profileDob: user?.dateOfBirth,
      profileGender: user?.gender,
    });
  } catch (error) {
    console.error('Get KYC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = payload.id as string;
    const body = await req.json();
    const {
      kycName, kycDob, kycGender,
      documentType, documentNumber, documentFront, documentBack,
      houseRoadVillage, upazilaThana, district, division, postalCode,
      selfiePhoto, selfieRight, selfieLeft, selfieSmile, selfieBlink,
      gpsLatitude, gpsLongitude,
    } = body;

    // === Validation ===

    // Personal info
    if (!kycName || kycName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!kycDob) {
      return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    }

    if (!kycGender || !['male', 'female', 'other'].includes(kycGender)) {
      return NextResponse.json({ error: 'Gender is required' }, { status: 400 });
    }

    // Document
    if (!documentType || !['nid', 'driving_licence', 'passport'].includes(documentType)) {
      return NextResponse.json({ error: 'Valid document type is required (NID, Driving Licence, or Passport)' }, { status: 400 });
    }

    if (!documentNumber) {
      return NextResponse.json({ error: 'Document number is required' }, { status: 400 });
    }

    // NID-specific validation: 10, 13, or 17 digits
    if (documentType === 'nid' && !isValidNid(documentNumber)) {
      return NextResponse.json({ error: 'NID number must be 10, 13, or 17 digits' }, { status: 400 });
    }

    if (!documentFront) {
      return NextResponse.json({ error: 'Document front side photo is required' }, { status: 400 });
    }

    // Back side required for NID and Driving Licence, not for Passport
    if (documentType !== 'passport' && !documentBack) {
      return NextResponse.json({ error: 'Document back side photo is required' }, { status: 400 });
    }

    // Address
    if (!houseRoadVillage) {
      return NextResponse.json({ error: 'House/Road/Village is required' }, { status: 400 });
    }
    if (!upazilaThana) {
      return NextResponse.json({ error: 'Upazila/Thana is required' }, { status: 400 });
    }
    if (!district) {
      return NextResponse.json({ error: 'District is required' }, { status: 400 });
    }
    if (!division) {
      return NextResponse.json({ error: 'Division is required' }, { status: 400 });
    }

    // Selfie
    if (!selfiePhoto) {
      return NextResponse.json({ error: 'Front selfie photo is required' }, { status: 400 });
    }

    // === Check existing KYC ===
    const existingKyc = await db.kyc.findUnique({ where: { userId } });
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine if name/dob/gender has changed from profile
    const nameChanged = existingKyc?.nameChanged || kycName.trim() !== user.name;
    const dobChanged = existingKyc?.dobChanged || kycDob !== (user.dateOfBirth || '');
    const genderChanged = existingKyc?.genderChanged || kycGender !== (user.gender || '');

    // If previously changed once, lock it
    if (existingKyc?.nameChanged && kycName.trim() !== existingKyc.kycName) {
      return NextResponse.json({ error: 'Name has already been changed once and cannot be changed again' }, { status: 400 });
    }
    if (existingKyc?.dobChanged && kycDob !== existingKyc.kycDob) {
      return NextResponse.json({ error: 'Date of birth has already been changed once and cannot be changed again' }, { status: 400 });
    }
    if (existingKyc?.genderChanged && kycGender !== existingKyc.kycGender) {
      return NextResponse.json({ error: 'Gender has already been changed once and cannot be changed again' }, { status: 400 });
    }

    if (existingKyc) {
      if (existingKyc.status === 'pending') {
        return NextResponse.json({ error: 'You already have a pending KYC application' }, { status: 409 });
      }
      if (existingKyc.status === 'approved') {
        return NextResponse.json({ error: 'Your KYC has already been approved' }, { status: 409 });
      }

      // If rejected, allow resubmission
      const updatedKyc = await db.kyc.update({
        where: { userId },
        data: {
          kycName: kycName.trim(),
          kycDob,
          kycGender,
          nameChanged,
          dobChanged,
          genderChanged,
          documentType,
          documentNumber,
          documentFront,
          documentBack: documentType === 'passport' ? null : (documentBack || null),
          houseRoadVillage,
          upazilaThana,
          district,
          division,
          postalCode: postalCode || null,
          selfiePhoto,
          selfieRight: selfieRight || null,
          selfieLeft: selfieLeft || null,
          selfieSmile: selfieSmile || null,
          selfieBlink: selfieBlink || null,
          gpsLatitude: gpsLatitude || null,
          gpsLongitude: gpsLongitude || null,
          status: 'pending',
          reviewedBy: null,
          reviewNote: null,
          reviewedAt: null,
          submittedAt: new Date(),
        },
      });

      // Update user profile name/dob/gender if changed
      if (nameChanged) await db.user.update({ where: { id: userId }, data: { name: kycName.trim() } });
      if (dobChanged) await db.user.update({ where: { id: userId }, data: { dateOfBirth: kycDob } });
      if (genderChanged) await db.user.update({ where: { id: userId }, data: { gender: kycGender } });

      await db.notification.create({
        data: {
          userId,
          title: 'KYC Resubmitted',
          message: 'Your KYC documents have been resubmitted for review. We will notify you once reviewed.',
          type: 'info',
        },
      });

      await db.activityLog.create({
        data: { userId, action: 'kyc_resubmitted', details: 'KYC resubmitted for review' },
      });

      return NextResponse.json({ kyc: updatedKyc }, { status: 200 });
    }

    // Create new KYC
    const kyc = await db.kyc.create({
      data: {
        userId,
        kycName: kycName.trim(),
        kycDob,
        kycGender,
        nameChanged,
        dobChanged,
        genderChanged,
        documentType,
        documentNumber,
        documentFront,
        documentBack: documentType === 'passport' ? null : (documentBack || null),
        houseRoadVillage,
        upazilaThana,
        district,
        division,
        postalCode: postalCode || null,
        selfiePhoto,
        selfieRight: selfieRight || null,
        selfieLeft: selfieLeft || null,
        selfieSmile: selfieSmile || null,
        selfieBlink: selfieBlink || null,
        gpsLatitude: gpsLatitude || null,
        gpsLongitude: gpsLongitude || null,
        status: 'pending',
      },
    });

    // Update user profile if name/dob/gender changed
    if (nameChanged) await db.user.update({ where: { id: userId }, data: { name: kycName.trim() } });
    if (dobChanged) await db.user.update({ where: { id: userId }, data: { dateOfBirth: kycDob } });
    if (genderChanged) await db.user.update({ where: { id: userId }, data: { gender: kycGender } });

    await db.notification.create({
      data: {
        userId,
        title: 'KYC Submitted',
        message: 'Your KYC documents have been submitted for review. We will notify you once reviewed.',
        type: 'info',
      },
    });

    await db.activityLog.create({
      data: { userId, action: 'kyc_submitted', details: 'KYC submitted for review' },
    });

    return NextResponse.json({ kyc }, { status: 201 });
  } catch (error) {
    console.error('Submit KYC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
