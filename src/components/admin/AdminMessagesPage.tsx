'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle, Search, User, ChevronLeft, ChevronRight,
  Send, Clock, Eye, ArrowRight, Loader2
} from 'lucide-react';

interface Conversation {
  id: string;
  orderId: string;
  participants: { id: string; name: string; role: string }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  useEffect(() => {
    fetch('/api/admin/messages', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.conversations) setConversations(d.conversations); setLoading(false); })
      .catch(() => { setError('Failed to load conversations'); setLoading(false); });
  }, []);

  const loadMessages = (chatId: string) => {
    fetch(`/api/admin/messages?chatId=${chatId}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.messages) setMessages(d.messages); })
      .catch(() => {});
  };

  const filteredConversations = conversations.filter(c =>
    !search ||
    c.orderId.toLowerCase().includes(search.toLowerCase()) ||
    c.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" /> Message Management
          </h1>
          <p className="text-sm text-muted-foreground">{conversations.length} conversations</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectChat(conv)}
                    className={`w-full p-3 rounded-lg transition-all text-left ${
                      selectedChat?.id === conv.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{conv.orderId}</span>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs">{conv.unreadCount}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {conv.participants.map((p, i) => (
                        <span key={i} className="text-xs text-muted-foreground">
                          <User className="w-3 h-3 inline" /> {p.name}
                          {i < conv.participants.length - 1 && <ArrowRight className="w-3 h-3 inline mx-1" />}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(conv.lastMessageTime).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">
              {selectedChat
                ? `Chat - ${selectedChat.orderId}`
                : 'Select a conversation'
              }
            </CardTitle>
            {selectedChat && (
              <div className="flex items-center gap-2 mt-1">
                {selectedChat.participants.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {p.name} ({p.role})
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {!selectedChat ? (
              <div className="text-center py-16 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.senderId === selectedChat.participants[0]?.id ? '' : 'flex-row-reverse'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.senderId === selectedChat.participants[0]?.id
                          ? 'bg-muted/50'
                          : 'bg-primary/10'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{msg.senderName}</span>
                          <div className="flex items-center gap-1">
                            {!msg.isRead && <Eye className="w-3 h-3 text-muted-foreground" />}
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Input placeholder="View-only mode - admin cannot send messages" disabled />
                  <Button variant="outline" size="sm" disabled>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
