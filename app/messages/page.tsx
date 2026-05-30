'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, push, set, serverTimestamp } from 'firebase/database';
import { PlatformLead } from '@/lib/types';

function MessagesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [userDeals, setUserDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, {name: string, company: string}>>({});
  
  const [platformLeads, setPlatformLeads] = useState<PlatformLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deals' | 'leads'>('deals');
  const [connections, setConnections] = useState<Record<string, 'pending' | 'approved'>>({});
  const searchParams = useSearchParams();

  // Handle deep linking from leads page
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const leadIdParam = searchParams.get('leadId');
    if (tabParam === 'leads') {
      setActiveTab('leads');
      if (leadIdParam) {
        setSelectedLeadId(leadIdParam);
      }
    }
  }, [searchParams]);

  // Fetch connections
  useEffect(() => {
    if (!user) return;
    const connectionsRef = ref(database, 'lead_connections');
    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userConnections: Record<string, 'pending' | 'approved'> = {};
        Object.keys(data).forEach(key => {
          if (key.endsWith(`_${user.id}`)) {
            const leadId = key.split('_')[0];
            userConnections[leadId] = data[key].status;
          }
        });
        setConnections(userConnections);
      } else {
        setConnections({});
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch all users to map IDs to Names
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const map: Record<string, {name: string, company: string}> = {};
        Object.keys(data).forEach(key => {
          const u = data[key];
          map[key] = {
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
            company: u.company?.name || 'Unknown Company'
          };
        });
        setUsersMap(map);
      }
    });
    return () => unsubscribe();
  }, []);

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
    }, (error) => {
      console.error(error);
      setUserDeals([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch assigned platform leads
  useEffect(() => {
    if (!user) return;
    const leadsRef = ref(database, 'leads');
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let list = Object.keys(data).map(key => ({ ...data[key], id: key })) as PlatformLead[];
        list = list.filter(lead => {
          if (lead.assignmentType === 'all') return true;
          if (lead.assignmentType === 'users' && lead.assignedUsers?.includes(user.id)) return true;
          if (lead.assignmentType === 'categories' && user.category) {
            const uCats = Array.isArray(user.category) ? user.category : [user.category];
            if (uCats.some(c => lead.assignedCategories?.includes(c))) return true;
          }
          return false;
        });
        setPlatformLeads(list);
      } else {
        setPlatformLeads([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected deal or lead
  useEffect(() => {
    let messagesRef;
    if (activeTab === 'deals' && selectedDealId) {
      messagesRef = ref(database, `messages/${selectedDealId}`);
    } else if (activeTab === 'leads' && selectedLeadId && user) {
      messagesRef = ref(database, `lead_messages/${selectedLeadId}_${user.id}`);
    } else {
      setMessages([]);
      return;
    }

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setMessages(list);
      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error(error);
      setMessages([]);
    });

    return () => unsubscribe();
  }, [selectedDealId, selectedLeadId, activeTab, user]);

  const selectedDeal = userDeals.find(d => d.id === selectedDealId);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    try {
      if (activeTab === 'deals' && selectedDealId && selectedDeal) {
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
      } else if (activeTab === 'leads' && selectedLeadId) {
        const msgRef = push(ref(database, `lead_messages/${selectedLeadId}_${user.id}`));
        const msgData = {
          id: msgRef.key,
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          content: messageText,
          createdAt: serverTimestamp(),
        };

        await set(msgRef, msgData);
        setMessageText('');
      }
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
        <div className="h-full flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-full md:w-80 border-r border-outline-variant flex flex-col bg-white">
            {/* Header and Tabs */}
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Messages</h2>
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('deals')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'deals' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Deals
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'leads' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Platform Leads
                </button>
              </div>
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
              {activeTab === 'deals' ? (
                userDeals.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-on-surface-variant text-sm">No deal conversations yet</p>
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
                          {user?.role === 'buyer' 
                            ? `Seller: ${usersMap[deal.sellerId]?.name || deal.sellerId}` 
                            : `Buyer: ${usersMap[deal.buyerId]?.name || deal.buyerId}`}
                        </p>
                        <p className="text-xs text-on-surface-light truncate italic">
                          {deal.status.replace('_', ' ').toUpperCase()}
                        </p>
                      </button>
                    );
                  })
                )
              ) : (
                platformLeads.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-on-surface-variant text-sm">No assigned leads</p>
                  </div>
                ) : (
                  platformLeads.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 flex items-center gap-3 ${isSelected ? 'bg-primary/5 border-primary' : 'border-transparent'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface text-sm mb-0.5 truncate">{lead.name}</p>
                          <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Platform Lead</p>
                          <p className="text-xs text-on-surface-variant truncate">{lead.companyName}</p>
                        </div>
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50 overflow-hidden">
            {(activeTab === 'deals' && selectedDeal) || (activeTab === 'leads' && selectedLeadId) ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-outline-variant bg-white">
                  {activeTab === 'deals' && selectedDeal && (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-headline font-bold text-on-surface">
                          {selectedDeal.title}
                        </h3>
                        <p className="text-on-surface-variant text-sm">
                          {user?.role === 'buyer' 
                            ? `Seller: ${usersMap[selectedDeal.sellerId]?.name || selectedDeal.sellerId}` 
                            : `Buyer: ${usersMap[selectedDeal.buyerId]?.name || selectedDeal.buyerId}`}
                        </p>
                      </div>
                      <Link
                        href={`/deals/${selectedDeal.id}`}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                      >
                        View Deal
                      </Link>
                    </div>
                  )}
                  {activeTab === 'leads' && selectedLeadId && (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-headline font-bold text-on-surface">
                          {platformLeads.find(l => l.id === selectedLeadId)?.name}
                        </h3>
                        <p className="text-on-surface-variant text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined notranslate text-sm" translate="no">verified</span>
                          Platform Lead Support
                        </p>
                      </div>
                    </div>
                  )}
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
                {activeTab === 'leads' && selectedLeadId && connections[selectedLeadId] !== 'approved' ? (
                  <div className="p-6 border-t border-outline-variant bg-surface-container-low text-center">
                    <p className="text-on-surface-variant font-medium">
                      Connection pending approval. The lead must approve your request before you can chat.
                    </p>
                  </div>
                ) : (
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
                )}
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

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
