import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Allowed email domains for validation
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'live.com', 'msn.com',
  'aol.com', 'mail.com', 'yandex.com', 'zoho.com',
  'edu.bd', 'ac.bd', 'com.bd'
];

function validateEmailDomain(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
}

function validateBdPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (cleaned.startsWith('+88')) {
    const digits = cleaned.slice(3);
    return /^\d{11}$/.test(digits);
  }
  if (cleaned.startsWith('88')) {
    const digits = cleaned.slice(2);
    return /^\d{11}$/.test(digits);
  }
  return /^\d{11}$/.test(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const userId = formData.get('userId') as string | null;
    const attachmentFile = formData.get('attachment') as File | null;

    // Validation
    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email?.trim() || !validateEmailDomain(email.trim())) {
      return NextResponse.json({ error: 'Please use a valid email domain (e.g. @gmail.com, @outlook.com, @yahoo.com)' }, { status: 400 });
    }
    if (phone?.trim() && !validateBdPhone(phone.trim())) {
      return NextResponse.json({ error: 'Enter a valid +88 Bangladesh phone number (11 digits after +88)' }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Handle file attachment
    let attachmentPath: string | null = null;
    if (attachmentFile && attachmentFile.size > 0) {
      if (attachmentFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(attachmentFile.type)) {
        return NextResponse.json({ error: 'Unsupported file type. Allowed: JPG, PNG, PDF, DOC' }, { status: 400 });
      }

      // Save file to public/uploads/support
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'support');
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${attachmentFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      attachmentPath = `/uploads/support/${filename}`;
    }

    // Create support ticket in database
    const ticket = await db.supportTicket.create({
      data: {
        ...(userId ? { userId } : {}),
        fullName: fullName.trim(),
        phone: phone?.trim() || undefined,
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        attachment: attachmentPath || undefined,
        status: 'open',
        priority: 'medium',
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Support request submitted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('Support form submission error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
