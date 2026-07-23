'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  MessageCircle,
  Lock,
  ArrowLeft,
  User,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Bus,
  Train,
  Plane,
  Ship,
  QrCode,
  Truck,
  Handshake,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ───

interface OtherUser {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

interface LastMessage {
  content: string;
  createdAt: string;
  senderName: string;
}

interface OrderInfo {
  id: string;
  orderId: string;
  status: string;
  deliveryMethod?: string;
  ticket: {
    transportType: string;
    routeFrom: string;
    routeTo: string;
    departureDate: string;
  };
}

interface ConversationItem {
  id: string;
  orderId: string;
  otherUser: OtherUser | null;
  lastMessage: LastMessage | null;
  order: OrderInfo;
  updatedAt: string;
  unreadCount?: number;
}

interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
}

interface ActiveChat {
  id: string;
  orderId: string;
  order: OrderInfo & { deliveryMethod?: string; amount?: number; totalAmount?: number };
  otherUser: OtherUser | null;
  messages: MessageItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Props ───

interface BuyerSellerChatProps {
  initialOrderId?: string;
  userId: string;
}

// ─── Helpers ───

function getTransportIcon(type: string) {
  switch (type) {
    case 'bus':
      return <Bus className="size-3.5" />;
    case 'train':
      return <Train className="size-3.5" />;
    case 'flight':
      return <Plane className="size-3.5" />;
    case 'launch':
      return <Ship className="size-3.5" />;
    default:
      return <Bus className="size-3.5" />;
  }
}

function getDeliveryIcon(method: string) {
  switch (method) {
    case 'in_person':
      return <Handshake className="size-3.5" />;
    case 'courier':
      return <Truck className="size-3.5" />;
    case 'online_pdf':
      return <QrCode className="size-3.5" />;
    default:
      return <QrCode className="size-3.5" />;
  }
}

function getDeliveryLabel(method: string) {
  switch (method) {
    case 'in_person':
      return 'Meet in person';
    case 'courier':
      return 'Courier delivery';
    case 'online_pdf':
      return 'Digital delivery';
    default:
      return method;
  }
}

function getDeliveryInstruction(method: string) {
  switch (method) {
    case 'in_person':
      return 'Scan QR to confirm handover';
    case 'courier':
      return 'Scan QR on receipt of package';
    case 'online_pdf':
      return 'Download ticket PDF from order details';
    default:
      return '';
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('etr_token');
  } catch {
    return null;
  }
}

// ─── Component ───

export default function BuyerSellerChat({ initialOrderId, userId }: BuyerSellerChatProps) {
  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch conversations ───

  const fetchConversations = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in to view chats');
      setLoadingConversations(false);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data.chats || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ─── Fetch specific chat ───

  const fetchChat = useCallback(async (orderId: string) => {
    const token = getAuthToken();
    if (!token) return;

    setLoadingChat(true);
    try {
      const res = await fetch(`/api/chat?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load chat');
      const data = await res.json();
      setActiveChat(data.chat || null);
      setActiveChatId(data.chat?.id || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat');
    } finally {
      setLoadingChat(false);
    }
  }, []);

  // ─── Send message ───

  const sendMessage = useCallback(async () => {
    if (!messageText.trim() || !activeChatId || sendingMessage) return;

    const token = getAuthToken();
    if (!token) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: activeChatId,
          content: messageText.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      const data = await res.json();
      const newMessage: MessageItem = data.message;

      // Append to active chat
      if (activeChat) {
        setActiveChat({
          ...activeChat,
          messages: [...activeChat.messages, newMessage],
        });
      }

      setMessageText('');
      messageInputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [messageText, activeChatId, sendingMessage, activeChat]);

  // ─── Select conversation ───

  const selectConversation = useCallback(
    (orderId: string) => {
      fetchChat(orderId);
      setMobileView('chat');
    },
    [fetchChat]
  );

  // ─── Back to list (mobile) ───

  const backToList = useCallback(() => {
    setMobileView('list');
    setActiveChat(null);
    setActiveChatId(null);
  }, []);

  // ─── Auto-scroll ───

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // ─── Polling ───

  useEffect(() => {
    // Initial fetch
    fetchConversations();

    // If initialOrderId is provided, open that chat
    if (initialOrderId) {
      fetchChat(initialOrderId);
      setMobileView('chat');
    }

    // Set up polling
    pollingRef.current = setInterval(() => {
      if (activeChatId) {
        // Refresh active chat messages
        const token = getAuthToken();
        if (!token) return;

        fetch(`/api/chat?orderId=${activeChat?.orderId || ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.chat) {
              const prevLen = activeChat?.messages?.length || 0;
              const newLen = data.chat.messages?.length || 0;
              setActiveChat(data.chat);
              if (newLen > prevLen) {
                scrollToBottom();
              }
            }
          })
          .catch(() => {});
      } else {
        // Refresh conversation list
        fetchConversations();
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Re-setup polling when activeChatId changes
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      if (activeChatId) {
        const token = getAuthToken();
        if (!token) return;

        fetch(`/api/chat?orderId=${activeChat?.orderId || ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.chat) {
              const prevLen = activeChat?.messages?.length || 0;
              const newLen = data.chat.messages?.length || 0;
              setActiveChat(data.chat);
              if (newLen > prevLen) scrollToBottom();
            }
          })
          .catch(() => {});
      } else {
        fetchConversations();
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChatId, activeChat?.messages?.length, fetchConversations, scrollToBottom]);

  // Scroll to bottom when chat loads
  useEffect(() => {
    if (activeChat) scrollToBottom();
  }, [activeChat?.id, scrollToBottom]);

  // ─── Render: Conversation List Item ───

  const renderConversationItem = (conv: ConversationItem) => {
    const isSelected = activeChat?.orderId === conv.orderId;
    const transportIcon = getTransportIcon(conv.order.ticket.transportType);

    return (
      <button
        key={conv.id}
        onClick={() => selectConversation(conv.orderId)}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
          isSelected
            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
            : 'hover:bg-accent/50 border border-transparent'
        }`}
      >
        {/* Avatar */}
        <Avatar className="size-10 shrink-0 mt-0.5">
          {conv.otherUser?.avatar ? (
            <AvatarImage src={conv.otherUser.avatar} alt={conv.otherUser.name} />
          ) : null}
          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold text-sm">
            {conv.otherUser?.name?.charAt(0)?.toUpperCase() || <User className="size-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate text-foreground">
              {conv.otherUser?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : formatTime(conv.updatedAt)}
            </span>
          </div>

          {/* Order route info */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-muted-foreground">{transportIcon}</span>
            <span className="text-xs text-muted-foreground truncate">
              {conv.order.ticket.routeFrom} → {conv.order.ticket.routeTo}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize shrink-0">
              {conv.order.ticket.transportType}
            </Badge>
          </div>

          {/* Last message preview */}
          {conv.lastMessage && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <span className="font-medium">{conv.lastMessage.senderName}: </span>
              {truncate(conv.lastMessage.content, 40)}
            </p>
          )}
        </div>

        {/* Unread indicator */}
        {conv.unreadCount && conv.unreadCount > 0 && (
          <span className="shrink-0 size-2.5 rounded-full bg-blue-500 mt-2" />
        )}

        {/* Chevron for mobile */}
        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-3 hidden md:hidden" />
      </button>
    );
  };

  // ─── Render: Loading Skeleton ───

  const renderConversationSkeleton = () => (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderChatSkeleton = () => (
    <div className="flex flex-col h-full">
      <Skeleton className="h-16 w-full" />
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-3/5' : 'w-2/5'} rounded-lg`} />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );

  // ─── Render: Error State ───

  const renderError = (errMsg: string, onRetry: () => void) => (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground max-w-xs">{errMsg}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="size-3.5" />
        Try Again
      </Button>
    </div>
  );

  // ─── Render: Empty State ───

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
        <MessageCircle className="size-6 text-green-600 dark:text-green-400" />
      </div>
      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
    </div>
  );

  // ─── Render: Message Bubble ───

  const renderMessage = (msg: MessageItem) => {
    const isOwn = msg.senderId === userId;

    return (
      <div key={msg.id} className={`flex gap-2 mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {/* Other user avatar on left messages */}
        {!isOwn && (
          <Avatar className="size-7 shrink-0 mt-1">
            {msg.sender.avatar ? (
              <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
            ) : null}
            <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
              {msg.sender.name?.charAt(0)?.toUpperCase() || <User className="size-3" />}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
          {/* Sender name for other user */}
          {!isOwn && (
            <span className="text-xs text-muted-foreground mb-0.5 block">{msg.sender.name}</span>
          )}

          {/* Message bubble */}
          <div
            className={`inline-block rounded-xl px-3 py-2 text-sm break-words ${
              isOwn
                ? 'bg-[#16a34a] text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-sm'
            }`}
          >
            {msg.content}
          </div>

          {/* Timestamp */}
          <span className={`text-[10px] text-muted-foreground mt-0.5 block ${isOwn ? 'text-right' : ''}`}>
            {formatMessageTime(msg.createdAt)}
          </span>
        </div>
      </div>
    );
  };

  // ─── Render: Chat Header ───

  const renderChatHeader = () => {
    if (!activeChat) return null;

    const order = activeChat.order;
    const deliveryMethod = order.deliveryMethod || '';
    const deliveryIcon = getDeliveryIcon(deliveryMethod);
    const deliveryInstruction = getDeliveryInstruction(deliveryMethod);
    const transportIcon = getTransportIcon(order.ticket.transportType);

    return (
      <div className="border-b bg-white dark:bg-gray-950">
        {/* Order info banner */}
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border-b border-green-100 dark:border-green-900">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-[#16a34a] text-white text-xs gap-1 shrink-0">
              {transportIcon}
              {order.ticket.transportType}
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {order.ticket.routeFrom} → {order.ticket.routeTo}
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {order.ticket.departureDate}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted-foreground font-medium">Order:</span>
            <span className="text-xs font-semibold text-foreground">{order.orderId}</span>
            {deliveryMethod && (
              <>
                <Separator orientation="vertical" className="h-3" />
                <Badge variant="outline" className="text-xs gap-1 shrink-0 capitalize">
                  {deliveryIcon}
                  {getDeliveryLabel(deliveryMethod)}
                </Badge>
              </>
            )}
          </div>
          {deliveryInstruction && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1.5">
              <QrCode className="size-3" />
              {deliveryInstruction}
            </p>
          )}
        </div>

        {/* Other user info */}
        <div className="flex items-center gap-2 p-3">
          <Avatar className="size-9">
            {activeChat.otherUser?.avatar ? (
              <AvatarImage src={activeChat.otherUser.avatar} alt={activeChat.otherUser.name} />
            ) : null}
            <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold">
              {activeChat.otherUser?.name?.charAt(0)?.toUpperCase() || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="font-medium text-sm text-foreground truncate block">
              {activeChat.otherUser?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              @{activeChat.otherUser?.username || 'unknown'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───

  return (
    <Card className="w-full overflow-hidden border shadow-sm rounded-xl">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="size-5 text-[#16a34a]" />
            Messages
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs gap-1 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 shrink-0"
          >
            <Lock className="size-3" />
            End-to-end encrypted
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 pb-0">
        {/* Error banner */}
        {error && !loadingConversations && !loadingChat && (
          <div className="mx-4 mb-3">
            {renderError(error, () => {
              setError(null);
              if (activeChatId) fetchChat(activeChat?.orderId || '');
              else fetchConversations();
            })}
          </div>
        )}

        {/* Main layout: side-by-side on desktop, toggle on mobile */}
        <div className="flex h-[480px] md:h-[520px]">
          {/* ─── Conversation List Panel ─── */}
          <div
            className={`${
              mobileView === 'list' ? 'flex' : 'hidden md:flex'
            } flex-col w-full md:w-[340px] md:border-r shrink-0`}
          >
            {/* List header (desktop only shows) */}
            <div className="p-3 border-b hidden md:block">
              <span className="text-sm font-medium text-muted-foreground">Conversations</span>
            </div>

            {/* List content */}
            <ScrollArea className="flex-1">
              {loadingConversations ? (
                renderConversationSkeleton()
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center h-full">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground">
                    Chat will appear when you buy or sell a ticket
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {conversations.map(renderConversationItem)}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ─── Active Chat Panel ─── */}
          <div
            className={`${
              mobileView === 'chat' ? 'flex' : 'hidden md:flex'
            } flex-col flex-1 min-w-0`}
          >
            {loadingChat ? (
              renderChatSkeleton()
            ) : activeChat ? (
              <>
                {/* Mobile back button */}
                <div className="flex items-center gap-2 p-2 md:hidden border-b">
                  <Button variant="ghost" size="sm" onClick={backToList} className="gap-1">
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                </div>

                {/* Chat header */}
                {renderChatHeader()}

                {/* Messages area */}
                <ScrollArea className="flex-1 px-4 py-3">
                  {activeChat.messages.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="space-y-1">
                      {activeChat.messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message input */}
                <div className="p-3 border-t bg-white dark:bg-gray-950 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      ref={messageInputRef}
                      value={messageText}
                      onChange={(e) => {
                        if (e.target.value.length <= 2000) {
                          setMessageText(e.target.value);
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={sendingMessage}
                      className="flex-1 h-10"
                      maxLength={2000}
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      size="default"
                      disabled={!messageText.trim() || sendingMessage}
                      className="bg-[#16a34a] hover:bg-[#15803d] text-white shrink-0 h-10 px-4"
                    >
                      {sendingMessage ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </form>

                  {/* Char counter */}
                  {messageText.length > 1800 && (
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {messageText.length}/2000
                    </div>
                  )}

                  {/* Encryption badge */}
                  <div className="flex items-center gap-1.5 mt-2 justify-center">
                    <Lock className="size-3 text-green-600 dark:text-green-400" />
                    <span className="text-[11px] text-muted-foreground">
                      Messages are end-to-end encrypted
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* No active chat selected */
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full">
                <div className="size-16 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <MessageCircle className="size-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium text-foreground">Select a conversation</p>
                <p className="text-xs text-muted-foreground">
                  Choose a chat from the list to start messaging
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Lock className="size-3 text-green-600 dark:text-green-400" />
                  <span className="text-[11px] text-muted-foreground">
                    All chats are end-to-end encrypted
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
