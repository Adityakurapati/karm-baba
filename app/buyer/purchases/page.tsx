'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { ModernCard } from '@/components/ModernCard';

export default function BoughtProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ordersRef = ref(database, 'orders');
    const q = query(ordersRef, orderByChild('buyerId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(list);
      } else {
        setOrders([]);
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

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
                My Purchases
              </h1>
              <p className="text-on-surface-variant">
                History of all products you have bought on KARM BABA
              </p>
            </div>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant shadow-soft">
                  <p className="text-on-surface-variant text-xl">You haven&apos;t bought any products yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <ModernCard key={order.id} className="p-6 bg-white border border-outline-variant rounded-2xl flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-headline font-bold text-on-surface">
                            {order.productName}
                          </h3>
                          <p className="text-xs text-on-surface-variant">Order ID: {order.id}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex gap-8 text-sm">
                        <div>
                          <p className="text-on-surface-variant font-medium">Date</p>
                          <p className="font-bold text-on-surface">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant font-medium">Price</p>
                          <p className="font-bold text-primary">{order.currency} {order.price?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant font-medium">Seller ID</p>
                          <p className="font-bold text-on-surface truncate max-w-[150px]">{order.sellerId}</p>
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
