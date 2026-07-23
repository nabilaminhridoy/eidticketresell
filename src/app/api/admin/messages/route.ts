import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // If chatId is provided, return messages for that chat
    if (chatId) {
      const messages = await db.message.findMany({
        where: { chatId },
        include: {
          sender: { select: { id: true, name: true, username: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      const messageRecords = messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        senderName: m.sender.name,
        content: m.content,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      }));

      return NextResponse.json({ messages: messageRecords });
    }

    // Otherwise, return all chat conversations with participants and last message
    const [chats, total] = await Promise.all([
      db.chat.findMany({
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, username: true, role: true } },
            },
          },
          order: { select: { id: true, orderId: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.chat.count(),
    ]);

    const conversations = chats.map(chat => {
      const lastMessage = chat.messages[0];
      return {
        id: chat.id,
        orderId: chat.order?.orderId || '',
        participants: chat.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          role: p.user.role === 'verified_seller' ? 'seller' : 'buyer',
        })),
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt.toISOString() || chat.createdAt.toISOString(),
        unreadCount: chat.messages.filter(m => !m.isRead).length,
      };
    });

    return NextResponse.json({
      conversations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
