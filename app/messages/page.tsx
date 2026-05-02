'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAllDeals, mockUsers } from '@/lib/mockData';

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  if (isLoading || !user) return null;

  // Get all conversations from deals
  const allDeals = getAllDeals();
  const userDeals = user.role === 'buyer' ? allDeals.filter(d => d.buyerId === user.id) : allDeals.filter(d => d.sellerId === user.id);
  const selectedDeal = selectedDealId ? allDeals.find(d => d.id === selectedDealId) : null;

  const handleSendMessage = () => {
    if (messageText.trim() && selectedDeal) {
      // In a real app, this would be sent to the server
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

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
                  const otherUser = deal.buyerId === user.id ? mockUsers.find(u => u.id === deal.sellerId) : mockUsers.find(u => u.id === deal.buyerId);
                  const isSelected = selectedDealId === deal.id;
                  const lastMessage = deal.conversations[deal.conversations.length - 1];

                  return (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${isSelected ? 'bg-primary/5 border-primary' : 'border-transparent'}`}
                    >
                      <p className="font-bold text-on-surface text-sm mb-1">{deal.title}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{otherUser?.company.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {lastMessage ? lastMessage.content : 'No messages yet'}
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
                        {user.role === 'buyer' ? mockUsers.find(u => u.id === selectedDeal.sellerId)?.company.name : mockUsers.find(u => u.id === selectedDeal.buyerId)?.company.name}
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
                <div className="flex-1 overflow-auto p-6 space-y-4">
                  {selectedDeal.conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-on-surface-variant">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    selectedDeal.conversations.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-sm p-4 rounded-lg ${
                            msg.senderId === user.id
                              ? 'bg-primary text-white'
                              : 'bg-white border border-outline-variant text-on-surface'
                          }`}
                        >
                          <p className="text-sm mb-1 font-bold">
                            {msg.senderName}
                          </p>
                          <p className="text-sm mb-1">{msg.content}</p>
                          <p className={`text-xs ${msg.senderId === user.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
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
