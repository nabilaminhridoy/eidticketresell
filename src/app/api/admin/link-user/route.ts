import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

/**
 * Link/unlink an admin's frontend user account.
 * When an admin sets a username, we create a corresponding User account
 * so they can sell/buy tickets on the frontend. Their admin identity is
 * completely hidden — only their username is visible to other users.
 */
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
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const adminId = payload.id as string;
    const body = await req.json();
    const { action } = body;

    // Link: Create a User account for the admin with their username
    if (action === 'link') {
      const admin = await db.admin.findUnique({ where: { id: adminId } });
      if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

      if (!admin.username) {
        return NextResponse.json({ error: 'Please set a username in your profile first' }, { status: 400 });
      }

      // Check if a User account with this username already exists
      const existingUser = await db.user.findUnique({ where: { username: admin.username } });

      if (existingUser) {
        // If it's already linked to this admin, just return success
        if (existingUser.email === admin.email) {
          return NextResponse.json({
            success: true,
            message: 'Already linked',
            user: { id: existingUser.id, username: existingUser.username, name: existingUser.name },
          });
        }
        // Username taken by another user
        return NextResponse.json({ error: 'Username is already taken by another user' }, { status: 409 });
      }

      // Create a new User account with the admin's username
      // The password is the same as admin's password (they can change it separately on frontend)
      const user = await db.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          username: admin.username,
          phone: admin.phone,
          password: admin.password, // Same hashed password
          role: admin.role, // admin or super_admin
          avatar: admin.avatar,
          emailVerified: true,
          phoneVerified: admin.phone ? true : false,
          isActive: true,
        },
      });

      // Create wallet for the new user
      await db.wallet.create({
        data: { userId: user.id },
      });

      await db.adminActivityLog.create({
        data: {
          adminId,
          action: 'link_frontend_user',
          details: `Admin ${admin.email} linked frontend user account with username "${admin.username}"`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Frontend user account created with username "${admin.username}"`,
        user: { id: user.id, username: user.username, name: user.name },
      });
    }

    // Unlink: Deactivate the admin's frontend User account
    if (action === 'unlink') {
      const admin = await db.admin.findUnique({ where: { id: adminId } });
      if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

      if (!admin.username) {
        return NextResponse.json({ error: 'No username set' }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { username: admin.username } });
      if (!user || user.email !== admin.email) {
        return NextResponse.json({ error: 'No linked frontend account found' }, { status: 404 });
      }

      // Deactivate the frontend user account (don't delete — keep history)
      await db.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      await db.adminActivityLog.create({
        data: {
          adminId,
          action: 'unlink_frontend_user',
          details: `Admin ${admin.email} unlinked frontend user account "${admin.username}"`,
        },
      });

      return NextResponse.json({ success: true, message: 'Frontend user account deactivated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Link admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Check if admin has a linked frontend user account
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
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const adminId = payload.id as string;
    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    if (!admin.username) {
      return NextResponse.json({ linked: false, hasUsername: false });
    }

    const user = await db.user.findUnique({ where: { username: admin.username } });

    if (user && user.email === admin.email) {
      return NextResponse.json({
        linked: true,
        hasUsername: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          isActive: user.isActive,
          role: user.role,
        },
      });
    }

    return NextResponse.json({ linked: false, hasUsername: true, username: admin.username });
  } catch (error) {
    console.error('Check admin user link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
