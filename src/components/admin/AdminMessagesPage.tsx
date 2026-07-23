'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle, Search, User, ChevronLeft, ChevronRight,
  Send, Clock, Eye, ArrowRight
} from 'lucide-react';

interface Conversation {
  id: string;
  orderId: string;
  participants: { id: string; name: string; role: string }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'chat1', orderId: 'ORD-00000001', participants: [{ id: '5', name: 'Nasir Ahmed', role: 'buyer' }, { id: '1', name: 'Rahim Uddin', role: 'seller' }], lastMessage: 'Thank you for the ticket! Everything went smoothly.', lastMessageTime: '2025-01-16T17:00:00Z', unreadCount: 0 },
  { id: 'chat2', orderId: 'ORD-00000002', participants: [{ id: '4', name: 'Arif Khan', role: 'buyer' }, { id: '1', name: 'Rahim Uddin', role: 'seller' }], lastMessage: 'Can you send the PDF copy now?', lastMessageTime: '2025-01-17T08:00:00Z', unreadCount: 3 },
  { id: 'chat3', orderId: 'ORD-00000003', participants: [{ id: '5', name: 'Nasir Ahmed', role: 'buyer' }, { id: '3', name: 'Fatima Begum', role: 'seller' }], lastMessage: 'I will meet you at Sadarghat terminal at 5 PM.', lastMessageTime: '2025-01-13T14:00:00Z', unreadCount: 1 },
  { id: 'chat4', orderId: 'ORD-00000004', participants: [{ id: '2', name: 'Karim Hasan', role: 'buyer' }, { id: '2', name: 'Karim Hasan', role: 'seller' }], lastMessage: 'Payment is pending. Please complete the payment first.', lastMessageTime: '2025-01-18T12:00:00Z', unreadCount: 5 },
  { id: 'chat5', orderId: 'ORD-00000005', participants: [{ id: '4', name: 'Arif Khan', role: 'buyer' }, { id: '1', name: 'Rahim Uddin', role: 'seller' }], lastMessage: 'I need a refund. The ticket was expired.', lastMessageTime: '2025-01-09T10:00:00Z', unreadCount: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  chat1: [
    { id: 'msg1', chatId: 'chat1', senderId: '5', senderName: 'Nasir Ahmed', content: 'Hi! I just purchased your Dhaka-Chittagong bus ticket. When can I expect to receive it?', isRead: true, createdAt: '2025-01-15T12:10:00Z' },
    { id: 'msg2', chatId: 'chat1', senderId: '1', senderName: 'Rahim Uddin', content: 'Hi Nasir! Thanks for buying. I will send the PDF copy within 30 minutes.', isRead: true, createdAt: '2025-01-15T12:15:00Z' },
    { id: 'msg3', chatId: 'chat1', senderId: '1', senderName: 'Rahim Uddin', content: 'I have sent the ticket PDF to your email. Please check and confirm.', isRead: true, createdAt: '2025-01-15T12:40:00Z' },
    { id: 'msg4', chatId: 'chat1', senderId: '5', senderName: 'Nasir Ahmed', content: 'Received! The PNR number matches. Thank you for the quick delivery.', isRead: true, createdAt: '2025-01-15T13:00:00Z' },
    { id: 'msg5', chatId: 'chat1', senderId: '5', senderName: 'Nasir Ahmed', content: 'Thank you for the ticket! Everything went smoothly.', isRead: true, createdAt: '2025-01-16T17:00:00Z' },
  ],
  chat2: [
    { id: 'msg6', chatId: 'chat2', senderId: '4', senderName: 'Arif Khan', content: 'Hi, I bought your train ticket for Sylhet. Can you send the PDF copy?', isRead: true, createdAt: '2025-01-16T14:05:00Z' },
    { id: 'msg7', chatId: 'chat2', senderId: '1', senderName: 'Rahim Uddin', content: 'Sure, give me a moment. I will upload it now.', isRead: true, createdAt: '2025-01-16T14:10:00Z' },
    { id: 'msg8', chatId: 'chat2', senderId: '4', senderName: 'Arif Khan', content: 'Can you send the PDF copy now?', isRead: false, createdAt: '2025-01-17T08:00:00Z' },
  ],
  chat3: [
    { id: 'msg9', chatId: 'chat3', senderId: '5', senderName: 'Nasir Ahmed', content: 'Hi, I purchased your launch ticket. How will the counter copy be delivered?', isRead: true, createdAt: '2025-01-10T16:05:00Z' },
    { id: 'msg10', chatId: 'chat3', senderId: '3', senderName: 'Fatima Begum', content: 'We can meet at Sadarghat terminal before departure. I will hand over the physical ticket.', isRead: true, createdAt: '2025-01-10T16:30:00Z' },
    { id: 'msg11', chatId: 'chat3', senderId: '3', senderName: 'Fatima Begum', content: 'I will meet you at Sadarghat terminal at 5 PM.', isRead: false, createdAt: '2025-01-13T14:00:00Z' },
  ],
  chat4: [
    { id: 'msg12', chatId: 'chat4', senderId: '2', senderName: 'Karim Hasan', content: 'I want to buy this flight ticket. How do I proceed?', isRead: true, createdAt: '2025-01-18T11:05:00Z' },
    { id: 'msg13', chatId: 'chat4', senderId: '2', senderName: 'Karim Hasan', content: 'Payment is pending. Please complete the payment first.', isRead: false, createdAt: '2025-01-18T12:00:00Z' },
  ],
  chat5: [
    { id: 'msg14', chatId: 'chat5', senderId: '4', senderName: 'Arif Khan', content: 'The bus ticket you sold me was expired! The departure date was yesterday.', isRead: true, createdAt: '2025-01-08T15:00:00Z' },
    { id: 'msg15', chatId: 'chat5', senderId: '1', senderName: 'Rahim Uddin', content: 'I am sorry about that. I did not realize it was already expired. Let me refund you.', isRead: true, createdAt: '2025-01-08T15:30:00Z' },
    { id: 'msg16', chatId: 'chat5', senderId: '4', senderName: 'Arif Khan', content: 'I need a refund. The ticket was expired.', isRead: true, createdAt: '2025-01-09T10:00:00Z' },
  ],
};

export default function AdminMessagesPage() {
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const filteredConversations = conversations.filter(c =>
    !search ||
    c.orderId.toLowerCase().includes(search.toLowerCase()) ||
    c.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    const chatMessages = MOCK_MESSAGES[chat.id] || [];
    setMessages(chatMessages);
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
              {filteredConversations.length === 0 ? (
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
