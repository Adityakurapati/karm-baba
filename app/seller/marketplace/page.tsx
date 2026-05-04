'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, update, push, set, serverTimestamp } from 'firebase/database';

export default function MarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const requirementsRef = ref(database, 'requirements');
    const q = query(requirementsRef, orderByChild('status'), equalTo('open'));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        // Sort by createdAt desc
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setRequirements(list);
      } else {
        setRequirements([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async (req: any) => {
    if (!user) return;
    
    setProcessingId(req.id);
    try {
      // 1. Update requirement status
      const reqRef = ref(database, `requirements/${req.id}`);
      await update(reqRef, {
        status: 'matched',
        sellerId: user.id,
        updatedAt: serverTimestamp(),
      });

      // 2. Create a deal
      const dealsRef = ref(database, 'deals');
      const newDealRef = push(dealsRef);
      await set(newDealRef, {
        id: newDealRef.key,
        requirementId: req.id,
        buyerId: req.buyerId,
        sellerId: user.id,
        title: `Deal for ${req.title}`,
        status: 'new_supplier',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        quantity: req.quantity,
        unit: req.unit,
        expectedValue: req.budget,
      });

      // 3. Create notification for buyer
      const notificationsRef = ref(database, 'notifications');
      const newNotifRef = push(notificationsRef);
      await set(newNotifRef, {
        id: newNotifRef.key,
        userId: req.buyerId,
        title: 'Requirement Accepted',
        message: `Your requirement "${req.title}" has been accepted by a seller. A new deal has been initiated.`,
        type: 'requirement_accepted',
        link: `/buyer/deals/${newDealRef.key}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert('Requirement accepted successfully! Deal initiated.');
    } catch (error) {
      console.error('Error accepting requirement:', error);
      alert('Failed to accept requirement.');
    } finally {
      setProcessingId(null);
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
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          <div className="mb-8">
            <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
              Marketplace
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Browse open requirements from buyers and initiate deals
            </p>
          </div>

          {requirements.length === 0 ? (
            <ModernCard className="p-12 text-center">
              <p className="text-xl font-bold text-on-surface-light">No open requirements found in the marketplace.</p>
              <p className="text-on-surface-variant mt-2">Check back later for new opportunities.</p>
            </ModernCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {requirements.map((req) => (
                <ModernCard key={req.id} hover className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <ModernBadge variant="info">Open Requirement</ModernBadge>
                        <span className="text-xs text-on-surface-light font-medium">
                          Posted on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">
                        {req.title}
                      </h3>
                      <p className="text-on-surface-variant mb-4 max-w-2xl">
                        {req.description}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-1">Quantity</p>
                          <p className="font-bold text-on-surface">{req.quantity} {req.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-1">Budget</p>
                          <p className="font-bold text-on-surface">{req.budget} {req.currency}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-1">Category</p>
                          <p className="font-bold text-on-surface">{req.category}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-1">Delivery Date</p>
                          <p className="font-bold text-on-surface">{new Date(req.requiredDeliveryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-64 flex flex-col justify-center gap-3">
                      <ModernButton
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => handleAccept(req)}
                        loading={processingId === req.id}
                      >
                        Accept & Initiate Deal
                      </ModernButton>
                      <ModernButton
                        variant="outline"
                        size="md"
                        fullWidth
                      >
                        View Details
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
