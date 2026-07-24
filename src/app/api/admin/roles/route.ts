import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

// GET: Return all roles with their permissions
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const roles = await db.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const rolesFormatted = roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isDefault: r.isDefault,
      permissions: r.permissions.map(p => p.permission),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ roles: rolesFormatted });
  } catch (error) {
    console.error('Get admin roles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create role with permissions
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Check if role name already exists
    const existing = await db.role.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 });
    }

    const permissionList: string[] = permissions || [];

    const role = await db.role.create({
      data: {
        name,
        description: description || null,
        permissions: {
          create: permissionList.map((perm: string) => ({ permission: perm })),
        },
      },
      include: { permissions: true },
    });

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isDefault: role.isDefault,
        permissions: role.permissions.map(p => p.permission),
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update role by id with permissions
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, name, description, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // If name is being changed, check uniqueness
    if (name && name !== existing.name) {
      const nameConflict = await db.role.findUnique({ where: { name } });
      if (nameConflict) {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
      }
    }

    // Delete existing permissions and recreate
    const permissionList: string[] = permissions || [];

    await db.rolePermission.deleteMany({ where: { roleId: id } });

    const updated = await db.role.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        permissions: {
          create: permissionList.map((perm: string) => ({ permission: perm })),
        },
      },
      include: { permissions: true },
    });

    return NextResponse.json({
      role: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isDefault: updated.isDefault,
        permissions: updated.permissions.map(p => p.permission),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update admin role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete role by id
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const existing = await db.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Prevent deletion of default roles
    if (existing.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default role' }, { status: 403 });
    }

    await db.role.delete({ where: { id } });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete admin role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
