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

  const getProgress = (status: string) => {
    const stages = ['new_supplier', 'quote_received', 'negotiation', 'sample_requested', 'finalized'];
    const index = stages.indexOf(status);
    return ((index + 1) / stages.length) * 100;
  };

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
                className="px-4 py-2 rounded-lg font-bold border border-outline-variant hover:border-primary transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Deals Grid */}
          <div className="space-y-4">
            {deals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">No deals yet</p>
                <Link
                  href="/buyer/requirements"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  Post a Requirement
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
                      <div className="flex gap-6 flex-wrap mb-3">
                        <div>
                          <p className="text-xs text-on-surface-variant">Supplier</p>
                          <p className="font-bold text-on-surface">{deal.sellerId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Quantity</p>
                          <p className="font-bold text-on-surface">
                            {deal.quantity} {deal.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Price</p>
                          <p className="font-bold text-on-surface">
                            ${(deal.agreedPrice * deal.quantity).toLocaleString()} {deal.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Delivery</p>
                          <p className="font-bold text-on-surface">
                            {new Date(deal.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${getStatusColor(deal.status)}`}>
                        {deal.status.replace('_', ' ').charAt(0).toUpperCase() + deal.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${getProgress(deal.status)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {getProgress(deal.status).toFixed(0)}% Complete
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-outline-variant">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="flex-1 px-4 py-2 text-center bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                    >
                      View Deal
                    </Link>
                    {deal.status !== 'finalized' && deal.status !== 'cancelled' && (
                      <Link
                        href={`/deals/${deal.id}/negotiate`}
                        className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
