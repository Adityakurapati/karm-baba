'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp, query, orderByChild } from 'firebase/database';

// Update the props type to match Next.js 15 expectations
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DealDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dealId, setDealId] = useState<string | null>(null);
  const [deal, setDeal] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch deal and messages from Firebase
  useEffect(() => {
    params.then((resolvedParams) => {
      const id = resolvedParams.id;
      setDealId(id);

      // Fetch Deal
      const dealRef = ref(database, `deals/${id}`);
      const unsubscribeDeal = onValue(dealRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setDeal(data);
        }
        setLoading(false);
      });

      // Fetch Messages
      const messagesRef = ref(database, `messages/${id}`);
      const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          list.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
          setMessages(list);
        } else {
          setMessages([]);
        }
      });

      return () => {
        unsubscribeDeal();
        unsubscribeMessages();
      };
    });
  }, [params]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !dealId) return;

    try {
      const messageRef = push(ref(database, `messages/${dealId}`));
      const msgData = {
        id: messageRef.key,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: newMessage,
        createdAt: serverTimestamp(),
      };

      await set(messageRef, msgData);
      setNewMessage('');

      // Create notification for recipient
      const recipientId = user.id === deal.buyerId ? deal.sellerId : deal.buyerId;
      const notificationsRef = push(ref(database, 'notifications'));
      await set(notificationsRef, {
        id: notificationsRef.key,
        userId: recipientId,
        title: 'New Message',
        message: `${user.firstName} sent you a message regarding "${deal.title}"`,
        type: 'message_received',
        link: `/deals/${dealId}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'new_supplier': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quote_received': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'sample_requested': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalized': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProgress = (status: string) => {
    const stages = ['inquiry', 'new_supplier', 'quote_received', 'negotiation', 'sample_requested', 'finalized'];
    const index = stages.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / stages.length) * 100;
  };

  // Show loading state while params are being resolved
  if (!deal) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Loading deal...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-4 md:p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex-1 ml-4">
            <Link 
              href={user?.role === 'buyer' ? '/buyer/deals' : '/seller/deals'} 
              className="text-primary hover:underline text-sm font-bold"
            >
              ← Back to {user?.role === 'buyer' ? 'My Deals' : 'My Sales Deals'}
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-auto">
          {/* Deal Header */}
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 md:mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
                  {deal.title}
                </h1>
                <p className="text-on-surface-variant mb-4">{deal.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-headline font-black text-primary mb-2">
                  {deal.currency || '$'}{deal.expectedValue?.toLocaleString()}
                </p>
                <span className={`inline-block px-4 py-2 font-bold rounded-lg border ${getStatusColor(deal.status)}`}>
                  {deal.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Deal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Buyer ID</p>
                <p className="font-headline font-bold text-on-surface truncate">{deal.buyerId}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Seller ID</p>
                <p className="font-headline font-bold text-on-surface truncate">{deal.sellerId}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Created</p>
                <p className="font-headline font-bold text-on-surface">{new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Progress</p>
                <p className="font-headline font-bold text-on-surface">{getProgress(deal.status)}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-on-surface-variant">Deal Progress</p>
                <p className="text-sm font-bold text-on-surface">{getProgress(deal.status)}%</p>
              </div>
              <div className="w-full bg-surface-container rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${getProgress(deal.status)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-outline-variant">
            {['overview', 'timeline', 'documents', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-headline font-bold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-outline-variant p-6">
                  <h3 className="text-xl font-headline font-black text-on-surface mb-4">
                    Deal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Description</p>
                      <p className="text-on-surface">{deal.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Status</p>
                      <p className="text-on-surface font-bold">{deal.status}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-primary text-white rounded-xl p-6">
                  <h3 className="font-headline font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold text-left flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      Send Message
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold text-left flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">upload_file</span>
                      Upload Document
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold text-left flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">update</span>
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-black text-on-surface mb-6">
                Deal Timeline
              </h3>
              <div className="space-y-6">
                {(deal.timeline || []).map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      {index < (deal.timeline || []).length - 1 && (
                        <div className="h-16 w-1 bg-primary" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-headline font-bold text-on-surface">
                        {event.title}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!deal.timeline && (
                  <p className="text-on-surface-variant">No timeline events yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-black text-on-surface mb-6">
                Documents
              </h3>
              <div className="space-y-3">
                {(deal.documents || []).map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        description
                      </span>
                      <div>
                        <p className="font-bold text-on-surface">{doc.name}</p>
                        <p className="text-sm text-on-surface-variant">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-surface-container rounded transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                ))}
                {!deal.documents && (
                  <p className="text-on-surface-variant">No documents uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl border border-outline-variant p-6 h-[500px] flex flex-col">
              <h3 className="text-xl font-headline font-black text-on-surface mb-6">
                Messages
              </h3>
              <div className="flex-1 overflow-auto space-y-4 mb-6 pr-2">
                {messages.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl max-w-[80%] ${
                        msg.senderId === user?.id
                          ? 'bg-primary text-white ml-auto rounded-tr-none shadow-md shadow-primary/20'
                          : 'bg-surface-container border border-outline-variant mr-auto rounded-tl-none'
                      }`}
                    >
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${msg.senderId === user?.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
                        {msg.senderId === user?.id ? 'You' : msg.senderName}
                      </p>
                      <p className="text-sm mb-1">{msg.content}</p>
                      <p className={`text-[9px] ${msg.senderId === user?.id ? 'text-white/60' : 'text-on-surface-light'} text-right`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-on-surface"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
