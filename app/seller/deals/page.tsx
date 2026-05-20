'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { ModernBadge } from '@/components/ModernBadge';

export default function SellerDealsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const dealsRef = ref(database, 'deals');
    const q = query(dealsRef, orderByChild('sellerId'), equalTo(user.id));

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
      case 'new_supplier':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quote_received':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'negotiation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'sample_requested':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalized':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
              My Sales Deals
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Manage and track your sales agreements
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Active Deals',
                value: deals.filter(d => !['finalized', 'cancelled'].includes(d.status)).length.toString(),
                icon: '💼',
              },
              {
                label: 'Finalized',
                value: deals.filter(d => d.status === 'finalized').length.toString(),
                icon: '✅',
              },
              {
                label: 'Total Value',
                value: `$${deals.reduce((sum, d) => sum + (d.expectedValue || 0), 0).toLocaleString()}`,
                icon: '💰',
              },
              {
                label: 'Avg Deal Value',
                value: `$${deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + (d.expectedValue || 0), 0) / deals.length).toLocaleString() : '0'}`,
                icon: '📊',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-outline-variant hover:border-primary hover:shadow-md transition-all duration-300 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{card.value}</p>
                </div>
                <span className="text-3xl bg-surface-container-low p-2.5 rounded-xl border border-outline-variant">{card.icon}</span>
              </div>
            ))}
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {deals.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">No deals yet</p>
                <Link
                  href="/seller/marketplace"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-outline-variant p-4 hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between overflow-hidden"
                >
                  {/* Top content */}
                  <div className="min-h-0 flex-1 flex flex-col">
                    <div className="flex justify-between items-center gap-1 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded truncate max-w-[50%]" title={`Buyer ID: ${deal.buyerId}`}>
                        Buyer: {deal.buyerId?.slice(0, 6)}...
                      </span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getStatusColor(deal.status)}`}>
                        {getStatusText(deal.status)}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-on-surface line-clamp-1 leading-snug mb-1" title={deal.title}>
                      {deal.title}
                    </h3>
                    <div className="space-y-0.5 flex-1 flex flex-col justify-center min-h-0">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-on-surface-variant">Value</span>
                        <span className="font-bold text-primary">${deal.expectedValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-on-surface-variant">Qty</span>
                        <span className="font-bold text-on-surface truncate max-w-[60%]">{deal.quantity} {deal.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom content */}
                  <div className="pt-2 border-t border-outline-variant mt-2 shrink-0">
                    <button
                      onClick={() => setSelectedDeal(deal)}
                      className="w-full py-1.5 text-center text-[10px] bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Beautiful Deal Details Modal */}
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
                    Buyer ID: {selectedDeal.buyerId}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedDeal.status)}`}>
                    {getStatusText(selectedDeal.status)}
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
                    Agreement Created: {selectedDeal.createdAt ? new Date(selectedDeal.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Quantity</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedDeal.quantity} {selectedDeal.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unit Price</p>
                    <p className="text-base font-black text-on-surface">
                      ${selectedDeal.agreedPrice || '0'} {selectedDeal.currency || 'USD'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Value</p>
                    <p className="text-base font-black text-primary">
                      ${selectedDeal.expectedValue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedDeal.deliveryDate ? new Date(selectedDeal.deliveryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment Terms</h3>
                    <p className="text-sm font-bold text-on-surface">{selectedDeal.paymentTerms || 'Standard Terms'}</p>
                  </div>
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Delivery Terms</h3>
                    <p className="text-sm font-bold text-on-surface">{selectedDeal.deliveryTerms || 'Standard Terms'}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedDeal.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Additional Description</h3>
                    <div className="text-on-surface text-sm whitespace-pre-wrap bg-surface-container-lowest p-4 rounded-xl border border-outline-variant leading-relaxed">
                      {selectedDeal.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-all text-sm"
                >
                  Close
                </button>
                {selectedDeal.status !== 'finalized' && selectedDeal.status !== 'cancelled' && (
                  <button className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all text-sm">
                    Send Update
                  </button>
                )}
                <Link
                  href={`/deals/${selectedDeal.id}`}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all text-sm text-center"
                  onClick={() => setSelectedDeal(null)}
                >
                  Enter Deal Room
                </Link>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
