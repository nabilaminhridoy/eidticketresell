import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Image-related setting keys
const IMAGE_SETTING_KEYS = [
  'site_logo',
  'dark_mode_logo',
  'site_favicon',
  'payment_gateway_logo',
  'bkash_logo',
  'nagad_logo',
  'rocket_logo',
];

// Map setting keys to upload subdirectories
const KEY_TO_DIR: Record<string, string> = {
  site_logo: 'logos',
  dark_mode_logo: 'logos',
  site_favicon: 'favicon',
  payment_gateway_logo: 'payment',
  bkash_logo: 'payment',
  nagad_logo: 'payment',
  rocket_logo: 'payment',
};

function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return null;
  }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') {
    return null;
  }
  return payload;
}

// GET: Retrieve all image-related settings
export async function GET(req: NextRequest) {
  try {
    const user = authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.setting.findMany({
      where: {
        key: { in: IMAGE_SETTING_KEYS },
      },
      orderBy: { key: 'asc' },
    });

    // Also get all general media files stored in uploads
    const mediaSettings = await db.setting.findMany({
      where: {
        group: 'media',
      },
      orderBy: { key: 'desc' },
    });

    const imageSettings = settings.map(s => ({
      key: s.key,
      value: s.value,
      group: s.group,
    }));

    const mediaFiles = mediaSettings.map(s => ({
      key: s.key,
      value: s.value,
      group: s.group,
    }));

    return NextResponse.json({
      images: imageSettings,
      media: mediaFiles,
    });
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Upload a file and store its path in settings
export async function POST(req: NextRequest) {
  try {
    const user = authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const settingKey = formData.get('settingKey') as string | null;
    const category = formData.get('category') as string | null; // 'brand', 'payment', 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!settingKey) {
      return NextResponse.json({ error: 'No setting key provided' }, { status: 400 });
    }

    // Determine upload directory
    const subDir = KEY_TO_DIR[settingKey] || category || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Store path in settings (relative to public)
    const relativePath = `/uploads/${subDir}/${filename}`;
    const group = category || (KEY_TO_DIR[settingKey] ? 'images' : 'media');

    await db.setting.upsert({
      where: { key: settingKey },
      update: { value: relativePath, group },
      create: { key: settingKey, value: relativePath, group },
    });

    return NextResponse.json({
      success: true,
      path: relativePath,
      key: settingKey,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a media file
export async function DELETE(req: NextRequest) {
  try {
    const user = authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const settingKey = searchParams.get('key');

    if (!settingKey) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    // Get current value to find file path
    const setting = await db.setting.findUnique({
      where: { key: settingKey },
    });

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    // Clear the setting value (remove reference)
    await db.setting.update({
      where: { key: settingKey },
      data: { value: '' },
    });

    // Try to delete the actual file
    if (setting.value) {
      try {
        const { unlink } = await import('fs/promises');
        const filePath = path.join(process.cwd(), 'public', setting.value);
        await unlink(filePath);
      } catch {
        // File might not exist on disk, ignore
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
