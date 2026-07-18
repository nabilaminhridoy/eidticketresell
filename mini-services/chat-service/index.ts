import { createServer } from 'http';
import { Server } from 'socket.io';

// Types
interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

// In-memory stores
const messages = new Map<string, ChatMessage[]>();
const typingUsers = new Map<string, Set<string>>();
const userRooms = new Map<string, Set<string>>(); // socketId -> set of orderIds

// Helper: generate unique message ID
const generateMessageId = (): string =>
  `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create HTTP server
const httpServer = createServer();

// Initialize socket.io on the same server
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Intercept HTTP requests BEFORE socket.io by prepending to the listener chain
const existingListeners = httpServer.listeners('request').slice();
httpServer.removeAllListeners('request');

httpServer.on('request', (req, res) => {
  // Handle our custom HTTP endpoints first
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        connections: io.sockets.sockets.size,
        rooms: Array.from(messages.keys()).length,
        totalMessages: Array.from(messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
        timestamp: new Date().toISOString(),
      })
    );
    return; // Don't pass to socket.io
  }

  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        activeConnections: io.sockets.sockets.size,
        activeRooms: Array.from(messages.keys()).length,
        totalMessages: Array.from(messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
        roomsDetail: Array.from(messages.entries()).map(([orderId, msgs]) => ({
          orderId,
          messageCount: msgs.length,
          lastMessage: msgs[msgs.length - 1]?.timestamp || null,
        })),
      })
    );
    return; // Don't pass to socket.io
  }

  // Pass to socket.io's request handlers
  existingListeners.forEach((listener) => {
    (listener as any)(req, res);
  });
});

io.on('connection', (socket) => {
  console.log(`[Chat] User connected: ${socket.id}`);
  userRooms.set(socket.id, new Set());

  // Join a chat room for a specific order
  socket.on('join-chat', (orderId: string) => {
    if (!orderId || typeof orderId !== 'string') {
      socket.emit('error', { message: 'Invalid orderId' });
      return;
    }

    socket.join(orderId);
    userRooms.get(socket.id)?.add(orderId);

    console.log(`[Chat] User ${socket.id} joined chat for order ${orderId}`);

    // Send existing chat history to the joining user
    const existingMessages = messages.get(orderId) || [];
    socket.emit('chat-history', existingMessages);

    // Notify others in the room
    socket.to(orderId).emit('user-joined', { socketId: socket.id, orderId });
  });

  // Leave a chat room
  socket.on('leave-chat', (orderId: string) => {
    if (!orderId) return;

    socket.leave(orderId);
    userRooms.get(socket.id)?.delete(orderId);

    // Clean up typing state
    const typingSet = typingUsers.get(orderId);
    if (typingSet) {
      typingSet.forEach((userId) => {
        if (userId === socket.id) {
          typingSet.delete(userId);
          socket.to(orderId).emit('user-stop-typing', { userId });
        }
      });
    }

    console.log(`[Chat] User ${socket.id} left chat for order ${orderId}`);
    socket.to(orderId).emit('user-left', { socketId: socket.id, orderId });
  });

  // Send a message to a chat room
  socket.on('send-message', (data: { orderId: string; senderId: string; content: string }) => {
    const { orderId, senderId, content } = data;

    if (!orderId || !senderId || !content) {
      socket.emit('error', { message: 'Missing required fields: orderId, senderId, content' });
      return;
    }

    const message: ChatMessage = {
      id: generateMessageId(),
      senderId,
      content,
      timestamp: Date.now(),
    };

    // Store message in memory
    if (!messages.has(orderId)) {
      messages.set(orderId, []);
    }
    messages.get(orderId)!.push(message);

    // Remove typing indicator for this user
    const typingSet = typingUsers.get(orderId);
    if (typingSet) {
      typingSet.delete(senderId);
      socket.to(orderId).emit('user-stop-typing', { userId: senderId });
    }

    // Broadcast message to everyone in the room (including sender for confirmation)
    io.to(orderId).emit('message-received', message);

    console.log(`[Chat] Message in ${orderId} from ${senderId}: ${content.substring(0, 50)}...`);
  });

  // Typing indicator
  socket.on('typing', (data: { orderId: string; userId: string }) => {
    const { orderId, userId } = data;
    if (!orderId || !userId) return;

    if (!typingUsers.has(orderId)) {
      typingUsers.set(orderId, new Set());
    }
    typingUsers.get(orderId)!.add(userId);

    // Broadcast to others in the room
    socket.to(orderId).emit('user-typing', { userId, orderId });
  });

  // Stop typing indicator
  socket.on('stop-typing', (data: { orderId: string; userId: string }) => {
    const { orderId, userId } = data;
    if (!orderId || !userId) return;

    const typingSet = typingUsers.get(orderId);
    if (typingSet) {
      typingSet.delete(userId);
    }

    socket.to(orderId).emit('user-stop-typing', { userId, orderId });
  });

  // Get chat history for an order
  socket.on('get-chat-history', (orderId: string) => {
    const existingMessages = messages.get(orderId) || [];
    socket.emit('chat-history', existingMessages);
  });

  // Disconnect - leave all rooms
  socket.on('disconnect', () => {
    console.log(`[Chat] User disconnected: ${socket.id}`);

    // Clean up all rooms this user was in
    const rooms = userRooms.get(socket.id);
    if (rooms) {
      rooms.forEach((orderId) => {
        socket.leave(orderId);

        // Clean up typing state
        const typingSet = typingUsers.get(orderId);
        if (typingSet) {
          typingSet.forEach((userId) => {
            if (userId === socket.id) {
              typingSet.delete(userId);
              socket.to(orderId).emit('user-stop-typing', { userId });
            }
          });
        }

        // Notify room
        socket.to(orderId).emit('user-left', { socketId: socket.id, orderId });
      });
    }

    userRooms.delete(socket.id);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[Chat] Socket error (${socket.id}):`, error);
  });
});

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`[Chat] Chat service running on port ${PORT}`);
  console.log(`[Chat] Health check: http://localhost:${PORT}/health`);
  console.log(`[Chat] Stats: http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Chat] Received SIGTERM signal, shutting down...');
  httpServer.close(() => {
    console.log('[Chat] Chat service closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Chat] Received SIGINT signal, shutting down...');
  httpServer.close(() => {
    console.log('[Chat] Chat service closed');
    process.exit(0);
  });
});
