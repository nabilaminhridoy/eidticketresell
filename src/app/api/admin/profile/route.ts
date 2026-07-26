import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword, verifyPassword } from '@/lib/auth';

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Authorization token required' }, { status: 401 }) };
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return { payload };
}

// GET: Fetch current admin profile
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;
    const { id } = auth.payload as { id: string };

    const admin = await db.admin.findUnique({
      where: { id },
      include: { notificationPrefs: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const defaultNotifTypes = [
      'email_login', 'email_order', 'email_ticket',
      'sms_login', 'sms_order', 'sms_ticket',
      'push_all',
    ];

    const notifMap: Record<string, boolean> = {};
    for (const pref of admin.notificationPrefs) {
      notifMap[pref.type] = pref.enabled;
    }
    for (const type of defaultNotifTypes) {
      if (notifMap[type] === undefined) {
        notifMap[type] = true;
      }
    }

    return NextResponse.json({
      profile: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        avatar: admin.avatar,
        role: admin.role,
        isActive: admin.isActive,
        twoFactorEnabled: admin.twoFactorEnabled,
        lastLogin: admin.lastLogin?.toISOString() || null,
        createdAt: admin.createdAt.toISOString(),
      },
      notifications: notifMap,
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update admin profile (supports multiple actions)
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;
    const { id } = auth.payload as { id: string };

    const body = await req.json();
    const { action } = body;

    // Update profile info
    if (action === 'update_profile') {
      const { name, username, phone, email, avatar } = body;

      if (email) {
        const existing = await db.admin.findFirst({ where: { email, NOT: { id } } });
        if (existing) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }
      }

      if (username) {
        const existing = await db.admin.findFirst({ where: { username, NOT: { id } } });
        if (existing) {
          return NextResponse.json({ error: 'Username already in use' }, { status: 409 });
        }
      }

      const updated = await db.admin.update({
        where: { id },
        data: {
          name: name ?? undefined,
          username: username ?? undefined,
          phone: phone ?? undefined,
          email: email ?? undefined,
          avatar: avatar ?? undefined,
        },
      });

      await db.adminActivityLog.create({
        data: { adminId: id, action: 'profile_update', details: `Admin ${updated.email} updated profile` },
      });

      return NextResponse.json({
        profile: {
          id: updated.id, name: updated.name, username: updated.username,
          email: updated.email, phone: updated.phone, avatar: updated.avatar,
          role: updated.role, twoFactorEnabled: updated.twoFactorEnabled,
        },
      });
    }

    // Change password
    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      const admin = await db.admin.findUnique({ where: { id } });
      if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

      const valid = verifyPassword(currentPassword, admin.password);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });

      const hashedNewPassword = await hashPassword(newPassword);
      await db.admin.update({ where: { id }, data: { password: hashedNewPassword } });

      await db.adminActivityLog.create({
        data: { adminId: id, action: 'password_change', details: `Admin ${admin.email} changed password` },
      });

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    // Update notification preferences
    if (action === 'update_notifications') {
      const { notifications } = body as { notifications: Record<string, boolean> };
      for (const [type, enabled] of Object.entries(notifications)) {
        await db.adminNotificationPref.upsert({
          where: { adminId_type: { adminId: id, type } },
          update: { enabled },
          create: { adminId: id, type, enabled },
        });
      }
      return NextResponse.json({ success: true, message: 'Notification preferences updated' });
    }

    // Toggle 2FA
    if (action === 'toggle_2fa') {
      const { enabled } = body;
      const admin = await db.admin.findUnique({ where: { id } });
      if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

      await db.admin.update({ where: { id }, data: { twoFactorEnabled: enabled } });

      await db.adminActivityLog.create({
        data: { adminId: id, action: enabled ? '2fa_enabled' : '2fa_disabled', details: `Admin ${admin.email} ${enabled ? 'enabled' : 'disabled'} 2FA` },
      });

      return NextResponse.json({ success: true, twoFactorEnabled: enabled });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
