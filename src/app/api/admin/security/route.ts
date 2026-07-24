import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

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
    const section = searchParams.get('section') || 'overview';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (section === 'login-history') {
      const activities = await db.adminActivityLog.findMany({
        where: { action: { contains: 'login' } },
        include: { admin: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await db.adminActivityLog.count({
        where: { action: { contains: 'login' } },
      });

      return NextResponse.json({
        loginHistory: activities.map(a => ({
          id: a.id,
          user: a.admin?.email || a.details || 'Unknown',
          ip: a.ipAddress || 'N/A',
          time: a.createdAt.toISOString(),
          status: a.action.includes('failed') ? 'failed' : 'success',
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (section === 'ip-blocklist') {
      const blockedIps = await db.ipBlock.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        blockedIps: blockedIps.map(ip => ({
          id: ip.id,
          ipAddress: ip.ipAddress,
          reason: ip.reason || '',
          blockedBy: ip.blockedBy || '',
          createdAt: ip.createdAt.toISOString(),
        })),
      });
    }

    if (section === 'api-keys') {
      const apiKeys = await db.apiKey.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        apiKeys: apiKeys.map(k => ({
          id: k.id,
          name: k.name,
          key: k.key,
          permissions: k.permissions || '',
          isActive: k.isActive,
          lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
          createdAt: k.createdAt.toISOString(),
        })),
      });
    }

    // Overview - return counts
    const blockedIpCount = await db.ipBlock.count();
    const apiKeyCount = await db.apiKey.count();
    const loginHistoryCount = await db.adminActivityLog.count({ where: { action: { contains: 'login' } } });

    return NextResponse.json({
      overview: {
        loginHistoryCount,
        blockedIpCount,
        apiKeyCount,
      },
    });
  } catch (error) {
    console.error('Get admin security error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'block-ip') {
      const { ipAddress, reason } = body as { ipAddress: string; reason?: string };
      if (!ipAddress) {
        return NextResponse.json({ error: 'ipAddress is required' }, { status: 400 });
      }

      // Check if already blocked
      const existing = await db.ipBlock.findUnique({ where: { ipAddress } });
      if (existing) {
        return NextResponse.json({ error: 'IP address is already blocked' }, { status: 400 });
      }

      const ipBlock = await db.ipBlock.create({
        data: {
          ipAddress,
          reason: reason || null,
          blockedBy: auth.payload?.id || null,
        },
      });

      return NextResponse.json({
        success: true,
        ipBlock: {
          id: ipBlock.id,
          ipAddress: ipBlock.ipAddress,
          reason: ipBlock.reason || '',
          blockedBy: ipBlock.blockedBy || '',
          createdAt: ipBlock.createdAt.toISOString(),
        },
      });
    }

    if (action === 'unblock-ip') {
      const { id } = body as { id: string };
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      await db.ipBlock.delete({ where: { id } });

      return NextResponse.json({ success: true });
    }

    if (action === 'generate-api-key') {
      const { name, permissions } = body as { name: string; permissions?: string };
      if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
      }

      const key = `etr_${randomUUID().replace(/-/g, '')}`;

      const apiKey = await db.apiKey.create({
        data: {
          name,
          key,
          permissions: permissions || null,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions || '',
          isActive: apiKey.isActive,
          createdAt: apiKey.createdAt.toISOString(),
        },
      });
    }

    if (action === 'revoke-api-key') {
      const { id } = body as { id: string };
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      await db.apiKey.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Post admin security error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
