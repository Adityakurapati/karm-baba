'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, push, set, serverTimestamp } from 'firebase/database';

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [userDeals, setUserDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user's deals
  useEffect(() => {
    if (!user) return;

    const dealsRef = ref(database, 'deals');
    const field = user.role === 'buyer' ? 'buyerId' : 'sellerId';
    const q = query(dealsRef, orderByChild(field), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setUserDeals(list);
      } else {
        setUserDeals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected deal
  useEffect(() => {
    if (!selectedDealId) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(database, `messages/${selectedDealId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
        setMessages(list);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedDealId]);

  const selectedDeal = userDeals.find(d => d.id === selectedDealId);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedDeal || !user) return;

    try {
      const msgRef = push(ref(database, `messages/${selectedDealId}`));
      const msgData = {
        id: msgRef.key,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: messageText,
        createdAt: serverTimestamp(),
      };

      await set(msgRef, msgData);
      setMessageText('');

      // Create notification for recipient
      const recipientId = user.id === selectedDeal.buyerId ? selectedDeal.sellerId : selectedDeal.buyerId;
      const notificationsRef = push(ref(database, 'notifications'));
      await set(notificationsRef, {
        id: notificationsRef.key,
        userId: recipientId,
        title: 'New Message',
        message: `${user.firstName} sent you a message regarding "${selectedDeal.title}"`,
        type: 'message_received',
        link: `/deals/${selectedDealId}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (authLoading || loading) return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex-1 overflow-auto flex">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-80 border-r border-outline-variant flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">Messages</h2>
              <p className="text-xs text-on-surface-variant">Deal conversations</p>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-outline-variant">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none text-sm"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-auto divide-y divide-outline-variant">
              {userDeals.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-on-surface-variant text-sm">No conversations yet</p>
                </div>
              ) : (
                userDeals.map((deal) => {
                  const isSelected = selectedDealId === deal.id;
                  return (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${isSelected ? 'bg-primary/5 border-primary' : 'border-transparent'}`}
                    >
                      <p className="font-bold text-on-surface text-sm mb-1">{deal.title}</p>
                      <p className="text-xs text-on-surface-variant mb-1">
                        {user?.role === 'buyer' ? `Seller: ${deal.sellerId}` : `Buyer: ${deal.buyerId}`}
                      </p>
                      <p className="text-xs text-on-surface-light truncate italic">
                        {deal.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50">
            {selectedDeal ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-outline-variant bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-on-surface">
                        {selectedDeal.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm">
                        {user?.role === 'buyer' ? `Seller ID: ${selectedDeal.sellerId}` : `Buyer ID: ${selectedDeal.buyerId}`}
                      </p>
                    </div>
                    <Link
                      href={`/deals/${selectedDeal.id}`}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                    >
                      View Deal
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-6 space-y-4 flex flex-col-reverse">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-on-surface-variant">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-sm p-4 rounded-2xl ${
                            msg.senderId === user?.id
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-white border border-outline-variant text-on-surface rounded-tl-none'
                          }`}
                        >
                          <p className={`text-[10px] font-bold uppercase mb-1 ${msg.senderId === user?.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
                            {msg.senderId === user?.id ? 'You' : msg.senderName}
                          </p>
                          <p className="text-sm mb-1">{msg.content}</p>
                          <p className={`text-[9px] ${msg.senderId === user?.id ? 'text-white/60' : 'text-on-surface-light'} text-right`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-outline-variant bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-3 border border-outline-variant rounded-lg focus:border-primary outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-on-surface-variant text-lg mb-4">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
