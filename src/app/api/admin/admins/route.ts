import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

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

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [admins, total] = await Promise.all([
      db.admin.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.admin.count({ where }),
    ]);

    const adminRecords = admins.map(a => ({
      id: a.id,
      name: a.name,
      username: a.username,
      phone: a.phone,
      email: a.email,
      role: a.role,
      isActive: a.isActive,
      status: a.isActive ? 'active' : 'inactive',
      avatar: a.avatar,
      lastLogin: a.lastLogin?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      admins: adminRecords,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new admin
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await db.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'admin',
        isActive: true,
      },
    });

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        status: admin.isActive ? 'active' : 'inactive',
        avatar: admin.avatar,
        lastLogin: admin.lastLogin?.toISOString() || null,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update admin
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, name, email, role, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Check email uniqueness if being changed
    if (email && email !== existing.email) {
      const emailConflict = await db.admin.findUnique({ where: { email } });
      if (emailConflict) {
        return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 409 });
      }
    }

    const updated = await db.admin.update({
      where: { id },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        role: role ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    return NextResponse.json({
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        status: updated.isActive ? 'active' : 'inactive',
        avatar: updated.avatar,
        lastLogin: updated.lastLogin?.toISOString() || null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Deactivate admin (sets isActive to false)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Deactivate instead of delete
    const updated = await db.admin.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        status: updated.isActive ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
