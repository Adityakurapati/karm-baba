'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

export default function BuyerDealsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, {name: string, company: string}>>({});

  // Filter & Detail Modal State
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const dealsRef = ref(database, 'deals');
    const q = query(dealsRef, orderByChild('buyerId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setDeals(list);
      } else {
        setDeals([]);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setDeals([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch users for mapping IDs to names
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

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDeal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (authLoading || loading) return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry':
      case 'new_supplier':
        return 'bg-blue-100 text-blue-800';
      case 'quote_received':
        return 'bg-purple-100 text-purple-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'sample_requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalized':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgress = (status: string) => {
    const stages = ['inquiry', 'new_supplier', 'quote_received', 'negotiation', 'sample_requested', 'finalized'];
    const index = stages.indexOf(status);
    if (index === -1) return status === 'cancelled' ? 0 : 100;
    return ((index + 1) / stages.length) * 100;
  };

  // Map tabs to statuses
  const tabToStatuses: { [key: string]: string[] } = {
    'All': [],
    'New Supplier': ['inquiry', 'new_supplier'],
    'Quote Received': ['quote_received'],
    'Negotiation': ['negotiation', 'sample_requested'],
    'Finalized': ['finalized'],
  };

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    if (activeTab === 'All') return true;
    const targetStatuses = tabToStatuses[activeTab] || [];
    return targetStatuses.includes(deal.status);
  });

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              My Deals
            </h1>
            <p className="text-on-surface-variant">
              Track and manage all your purchase deals
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', 'New Supplier', 'Quote Received', 'Negotiation', 'Finalized'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-on-surface border-outline-variant hover:border-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDeals.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">
                  {deals.length === 0 ? "No deals yet" : "No matching deals found"}
                </p>
                {deals.length === 0 && (
                  <Link
                    href="/buyer/requirements"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                  >
                    Post a Requirement
                  </Link>
                )}
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-outline-variant p-5 hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between"
                >
                  {/* Top Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded truncate">
                        Deal
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(deal.status)}`}>
                        {deal.status.replace('_', ' ').charAt(0).toUpperCase() + deal.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-headline font-bold text-on-surface mb-2 line-clamp-2 leading-snug" title={deal.title}>
                      {deal.title}
                    </h3>
                    <div className="text-xs text-on-surface-variant mb-2">
                      <span className="font-bold block text-[10px] uppercase text-on-surface-variant/80 tracking-wider">Supplier Name</span>
                      <p className="font-bold text-on-surface truncate mt-0.5" title={usersMap[deal.sellerId]?.name || deal.sellerId}>
                        {usersMap[deal.sellerId]?.name || deal.sellerId}
                      </p>
                    </div>
                  </div>

                  {/* Middle Section - Compact Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${getProgress(deal.status)}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] text-on-surface-variant font-bold">
                      {getProgress(deal.status).toFixed(0)}% Complete
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-outline-variant flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedDeal(deal)}
                      className="w-full px-3 py-2 text-center text-xs bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                    >
                      View Detailed Deal
                    </button>
                    {deal.status !== 'finalized' && deal.status !== 'cancelled' && (
                      <Link
                        href={`/deals/${deal.id}/negotiate`}
                        className="w-full px-3 py-2 text-center text-xs bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                      >
                        Negotiate
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Beautiful Details Modal */}
        {selectedDeal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedDeal(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-wider">
                    Deal Details
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedDeal.status)}`}>
                    {selectedDeal.status.replace('_', ' ').charAt(0).toUpperCase() + selectedDeal.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
                    {selectedDeal.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Deal Created on {selectedDeal.createdAt ? new Date(selectedDeal.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                {/* Progress Status Card */}
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Deal Progression</span>
                    <span>{getProgress(selectedDeal.status).toFixed(0)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getProgress(selectedDeal.status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Supplier Name</p>
                    <p className="text-sm font-black text-on-surface truncate" title={usersMap[selectedDeal.sellerId]?.name || selectedDeal.sellerId}>
                      {usersMap[selectedDeal.sellerId]?.name || selectedDeal.sellerId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Quantity</p>
                    <p className="text-sm font-black text-on-surface">
                      {selectedDeal.quantity} {selectedDeal.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Agreed Price</p>
                    <p className="text-sm font-black text-primary">
                      {selectedDeal.agreedPrice ? `${(selectedDeal.agreedPrice * selectedDeal.quantity).toLocaleString()} ${selectedDeal.currency || 'USD'}` : 'N/A'}
                      <span className="block text-[10px] text-on-surface-variant font-medium">({selectedDeal.agreedPrice} / unit)</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery Date</p>
                    <p className="text-sm font-black text-on-surface">
                      {selectedDeal.deliveryDate ? new Date(selectedDeal.deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Deal ID/Metadata */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Reference Information</h3>
                  <div className="text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded-xl border border-outline-variant space-y-1">
                    <p><span className="font-bold">Deal Reference ID:</span> {selectedDeal.id}</p>
                    <p><span className="font-bold">Buyer Reference ID:</span> {selectedDeal.buyerId}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/deals/${selectedDeal.id}`}
                  className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-bold transition-colors text-center"
                  onClick={() => setSelectedDeal(null)}
                >
                  View Full Deal Log
                </Link>
                {selectedDeal.status !== 'finalized' && selectedDeal.status !== 'cancelled' && (
                  <Link
                    href={`/deals/${selectedDeal.id}/negotiate`}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors text-center"
                    onClick={() => setSelectedDeal(null)}
                  >
                    Negotiate
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
