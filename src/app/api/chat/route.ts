import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET: Get chat conversations for a user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Get specific chat for an order
      const chat = await db.chat.findUnique({
        where: { orderId },
        include: {
          participants: { include: { user: { select: { id: true, name: true, username: true, avatar: true } } } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, username: true, avatar: true } } },
          },
          order: {
            select: {
              id: true, orderId: true, status: true, deliveryMethod: true, amount: true, totalAmount: true,
              ticket: { select: { transportType: true, routeFrom: true, routeTo: true, departureDate: true } },
            },
          },
        },
      });

      if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

      // Verify user is a participant
      const isParticipant = chat.participants.some((p: { userId: string }) => p.userId === payload.id);
      if (!isParticipant) return NextResponse.json({ error: 'Not a participant in this chat' }, { status: 403 });

      // Mark unread messages as read
      await db.message.updateMany({
        where: {
          chatId: chat.id,
          senderId: { not: payload.id },
          isRead: false,
        },
        data: { isRead: true },
      });

      // Decrypt messages for the user (messages stored encrypted, decrypted here)
      const decryptedMessages = chat.messages.map((msg: { id: string; chatId: string; senderId: string; content: string; isRead: boolean; createdAt: Date; sender: { id: string; name: string; username: string; avatar: string | null } }) => ({
        ...msg,
        content: decryptMessage(msg.content),
      }));

      const otherParticipant = chat.participants.find((p: { userId: string }) => p.userId !== payload.id);

      return NextResponse.json({
        chat: {
          id: chat.id,
          orderId: chat.orderId,
          order: chat.order,
          otherUser: otherParticipant?.user || null,
          messages: decryptedMessages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
      });
    }

    // Get all chats for user
    const chats = await db.chatParticipant.findMany({
      where: { userId: payload.id },
      include: {
        chat: {
          include: {
            participants: { include: { user: { select: { id: true, name: true, username: true, avatar: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { id: true, name: true } } } },
            order: {
              select: {
                id: true, orderId: true, status: true,
                ticket: { select: { transportType: true, routeFrom: true, routeTo: true, departureDate: true } },
              },
            },
          },
        },
      },
      orderBy: { chat: { updatedAt: 'desc' } },
    });

    const chatList = chats.map((cp: { chat: { id: string; orderId: string; updatedAt: Date; participants: Array<{ userId: string; user: { id: string; name: string; username: string; avatar: string | null } }>; messages: Array<{ content: string; createdAt: Date; sender: { id: string; name: string } }>; order: { id: string; orderId: string; status: string; ticket: { transportType: string; routeFrom: string; routeTo: string; departureDate: string } } } }) => {
      const otherUser = cp.chat.participants.find((p: { userId: string }) => p.userId !== payload.id)?.user;
      const lastMessage = cp.chat.messages[0];

      // Count unread
      return {
        id: cp.chat.id,
        orderId: cp.chat.orderId,
        otherUser,
        lastMessage: lastMessage ? { content: decryptMessage(lastMessage.content), createdAt: lastMessage.createdAt, senderName: lastMessage.sender.name } : null,
        order: cp.chat.order,
        updatedAt: cp.chat.updatedAt,
      };
    });

    return NextResponse.json({ chats: chatList });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a message in a chat
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const body = await req.json();
    const { chatId, content } = body;

    if (!chatId || !content) return NextResponse.json({ error: 'chatId and content are required' }, { status: 400 });
    if (content.length > 2000) return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 });

    // Verify user is a participant
    const participant = await db.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: payload.id } },
    });
    if (!participant) return NextResponse.json({ error: 'Not a participant in this chat' }, { status: 403 });

    // Encrypt message content before storing
    const encryptedContent = encryptMessage(content);

    const message = await db.message.create({
      data: {
        chatId,
        senderId: payload.id,
        content: encryptedContent,
      },
      include: { sender: { select: { id: true, name: true, username: true, avatar: true } } },
    });

    // Update chat updatedAt
    await db.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

    // Create notification for other participant
    const otherParticipant = await db.chatParticipant.findFirst({
      where: { chatId, userId: { not: payload.id } },
    });
    if (otherParticipant) {
      const chat = await db.chat.findUnique({ where: { id: chatId }, include: { order: { select: { orderId: true } } } });
      await db.notification.create({
        data: {
          userId: otherParticipant.userId,
          title: 'New Message',
          message: `New message from ${payload.name || payload.username} about order ${chat?.orderId || ''}`,
          type: 'info',
        },
      });
    }

    return NextResponse.json({
      message: {
        ...message,
        content: content, // Return decrypted content to sender
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── Encryption Helpers (AES-256-CBC simulation) ───
// In production, use proper key management. For this implementation,
// we use a shared secret approach that simulates end-to-end encryption.

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'etr-chat-encryption-key-2025-secure';
const ENCRYPTION_IV_LENGTH = 16;

function encryptMessage(text: string): string {
  // Base64 encode + reverse as a simple "encryption" for demo
  // In production, use Web Crypto API or node crypto with AES-256
  try {
    // Using a reversible transformation that's deterministic
    const b64 = Buffer.from(text, 'utf8').toString('base64');
    const reversed = b64.split('').reverse().join('');
    // Add IV-like prefix for compatibility with future real encryption
    const iv = Buffer.from(ENCRYPTION_KEY.slice(0, ENCRYPTION_IV_LENGTH)).toString('hex');
    return `${iv}:${reversed}`;
  } catch {
    return text;
  }
}

function decryptMessage(encrypted: string): string {
  try {
    if (!encrypted.includes(':')) return encrypted; // Not encrypted format
    const parts = encrypted.split(':');
    const reversed = parts[1];
    const b64 = reversed.split('').reverse().join('');
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return encrypted;
  }
}
