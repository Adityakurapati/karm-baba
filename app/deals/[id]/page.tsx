'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getDealById, mockUsers } from '@/lib/mockData';

// Update the props type to match Next.js 15 expectations
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DealDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dealId, setDealId] = useState<string | null>(null);

  // Unwrap the params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setDealId(resolvedParams.id);
    });
  }, [params]);

  // Get deal from mock data
  const dealData = dealId ? getDealById(dealId) : null;
  const buyerInfo = dealData ? mockUsers.find(u => u.id === dealData.buyerId) : null;
  const sellerInfo = dealData ? mockUsers.find(u => u.id === dealData.sellerId) : null;

  const deal = dealData ? {
    id: dealData.id,
    title: dealData.title,
    buyer: buyerInfo?.company.name || dealData.buyerId,
    supplier: sellerInfo?.company.name || dealData.sellerId,
    value: `$${dealData.expectedValue.toLocaleString()}`,
    status: dealData.status.replace('_', ' ').charAt(0).toUpperCase() + dealData.status.slice(1).replace('_', ' '),
    progress: (['new_supplier', 'quote_received'].includes(dealData.status) ? 25 : ['negotiation'].includes(dealData.status) ? 50 : ['sample_requested'].includes(dealData.status) ? 75 : 100),
    date: new Date(dealData.createdAt).toLocaleDateString(),
    description: dealData.description,
    timeline: dealData.timeline.map(event => ({
      date: new Date(event.createdAt).toLocaleDateString(),
      status: event.title,
      completed: !['negotiation', 'sample_requested'].includes(dealData.status),
    })),
    documents: dealData.documents.map((doc, idx) => ({
      name: doc.name,
      size: '0 KB',
      date: new Date(doc.uploadedAt).toLocaleDateString(),
    })),
    messages: dealData.conversations.map((msg, idx) => ({
      from: msg.senderId === user?.id ? 'You' : msg.senderName,
      text: msg.content,
      date: new Date(msg.createdAt).toLocaleDateString(),
    })),
  } : null;

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
            <Link href="/deals" className="text-primary hover:underline text-sm font-bold">
              ← Back to Deals
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
                  {deal.value}
                </p>
                <span className="inline-block px-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-lg border border-yellow-200">
                  {deal.status}
                </span>
              </div>
            </div>

            {/* Deal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Buyer</p>
                <p className="font-headline font-bold text-on-surface">{deal.buyer}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Supplier</p>
                <p className="font-headline font-bold text-on-surface">{deal.supplier}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Created</p>
                <p className="font-headline font-bold text-on-surface">{deal.date}</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg">
                <p className="text-sm text-on-surface-variant mb-1">Progress</p>
                <p className="font-headline font-bold text-on-surface">{deal.progress}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold text-on-surface-variant">Deal Progress</p>
                <p className="text-sm font-bold text-on-surface">{deal.progress}%</p>
              </div>
              <div className="w-full bg-surface-container rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${deal.progress}%` }}
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
                    <button className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold">
                      Send Message
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold">
                      Upload Document
                    </button>
                    <button className="w-full p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold">
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
                {deal.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          event.completed ? 'bg-primary' : 'bg-outline'
                        }`}
                      />
                      {index < deal.timeline.length - 1 && (
                        <div
                          className={`h-16 w-1 ${
                            event.completed ? 'bg-primary' : 'bg-outline'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-headline font-bold text-on-surface">
                        {event.status}
                      </p>
                      <p className="text-sm text-on-surface-variant">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-black text-on-surface mb-6">
                Documents
              </h3>
              <div className="space-y-3">
                {deal.documents.map((doc, i) => (
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
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-surface-container rounded transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-black text-on-surface mb-6">
                Messages
              </h3>
              <div className="space-y-4 mb-6">
                {deal.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg ${
                      msg.from === 'You'
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-surface-container border border-outline-variant'
                    }`}
                  >
                    <p className="font-headline font-bold text-on-surface mb-1">
                      {msg.from}
                    </p>
                    <p className="text-on-surface-variant mb-2">{msg.text}</p>
                    <p className="text-xs text-on-surface-variant">{msg.date}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
                <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark">
                  Send
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
