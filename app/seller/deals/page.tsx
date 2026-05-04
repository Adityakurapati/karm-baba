'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

export default function SellerDealsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    });

    return () => unsubscribe();
  }, [user]);

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

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              My Sales Deals
            </h1>
            <p className="text-on-surface-variant">
              Manage and track your sales agreements
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                value: `$${deals.reduce((sum, d) => sum + d.expectedValue, 0).toLocaleString()}`,
                icon: '💰',
              },
              {
                label: 'Avg Deal Value',
                value: `$${deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.expectedValue, 0) / deals.length).toLocaleString() : '0'}`,
                icon: '📊',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors"
              >
                <p className="text-sm text-on-surface-variant mb-2">{card.label}</p>
                <p className="text-2xl font-headline font-black text-on-surface">{card.value}</p>
                <span className="text-2xl">{card.icon}</span>
              </div>
            ))}
          </div>

          {/* Deals List */}
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">No deals yet</p>
                <Link
                  href="/seller/leads"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  View Leads
                </Link>
              </div>
            ) : (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-xl border border-outline-variant p-6 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                        {deal.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm mb-4">
                        Buyer: {deal.buyerId}
                      </p>

                      <div className="flex gap-6 flex-wrap mb-4">
                        <div>
                          <p className="text-xs text-on-surface-variant">Quantity</p>
                          <p className="font-bold text-on-surface">
                            {deal.quantity} {deal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Unit Price</p>
                          <p className="font-bold text-on-surface">
                            ${deal.agreedPrice} {deal.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Total Value</p>
                          <p className="font-bold text-on-surface text-orange-600">
                            ${deal.expectedValue.toLocaleString()} {deal.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Delivery</p>
                          <p className="font-bold text-on-surface">
                            {new Date(deal.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {deal.description && (
                        <p className="text-on-surface-variant text-sm mb-4">
                          {deal.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(deal.status)}`}>
                        {deal.status.replace('_', ' ').charAt(0).toUpperCase() + deal.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Delivery Terms */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <p className="text-xs text-on-surface-variant">Payment Terms</p>
                      <p className="text-sm font-bold text-on-surface">{deal.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Delivery Terms</p>
                      <p className="text-sm font-bold text-on-surface">{deal.deliveryTerms}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-outline-variant">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="flex-1 px-4 py-2 text-center bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                    >
                      View Details
                    </Link>
                    {deal.status !== 'finalized' && deal.status !== 'cancelled' && (
                      <button className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors">
                        Send Update
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
