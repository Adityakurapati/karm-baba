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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedRequirement, setSelectedRequirement] = useState<any | null>(null);

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
    }, (error) => {
      console.error(error);
      setRequirements([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRequirement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      setSelectedRequirement(null); // Close modal on success
    } catch (error) {
      console.error('Error accepting requirement:', error);
      alert('Failed to accept requirement.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      req.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
              Marketplace
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Browse open requirements from buyers and initiate deals
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2.5 border border-outline-variant rounded-xl focus:border-primary outline-none bg-white text-on-surface text-sm transition-all"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-outline-variant rounded-xl focus:border-primary outline-none bg-white text-on-surface text-sm transition-all"
            >
              <option value="All Categories">All Categories</option>
              <option value="Automotive">Automotive</option>
              <option value="Textiles">Textiles</option>
              <option value="Electronics">Electronics</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          {filteredRequirements.length === 0 ? (
            <ModernCard className="p-12 text-center">
              <p className="text-xl font-bold text-on-surface-light">No open requirements found matching criteria.</p>
              <p className="text-on-surface-variant mt-2">Check back later for new opportunities.</p>
            </ModernCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-outline-variant p-4 hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between overflow-hidden"
                >
                  {/* Top content */}
                  <div className="min-h-0 flex-1 flex flex-col">
                    <div className="flex justify-between items-center gap-1 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded truncate max-w-[65%]" title={req.category}>
                        {req.category}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">
                        Open
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-on-surface line-clamp-1 leading-snug mb-1" title={req.title}>
                      {req.title}
                    </h3>
                    <p className="text-on-surface-variant text-[10px] line-clamp-3 leading-relaxed flex-1 overflow-hidden">
                      {req.description}
                    </p>
                  </div>

                  {/* Bottom content */}
                  <div className="pt-2 border-t border-outline-variant mt-2 shrink-0">
                    <button
                      onClick={() => setSelectedRequirement(req)}
                      className="w-full py-1.5 text-center text-[10px] bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Beautiful Details Modal */}
        {selectedRequirement && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedRequirement(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-wider">
                    {selectedRequirement.category}
                  </span>
                  <ModernBadge variant="info">Open Requirement</ModernBadge>
                </div>
                <button
                  onClick={() => setSelectedRequirement(null)}
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
                    {selectedRequirement.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Posted on {selectedRequirement.createdAt ? new Date(selectedRequirement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Quantity</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedRequirement.quantity} {selectedRequirement.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Budget</p>
                    <p className="text-base font-black text-primary">
                      {selectedRequirement.budget ? `${selectedRequirement.budget.toLocaleString()} ${selectedRequirement.currency || 'USD'}` : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery Date</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedRequirement.requiredDeliveryDate ? new Date(selectedRequirement.requiredDeliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Detailed Specifications</h3>
                  <div className="text-on-surface text-sm whitespace-pre-wrap bg-surface-container-lowest p-4 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedRequirement.description}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedRequirement(null)}
                  className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-all text-sm"
                >
                  Close
                </button>
                <ModernButton
                  variant="primary"
                  size="md"
                  onClick={() => handleAccept(selectedRequirement)}
                  loading={processingId === selectedRequirement.id}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm"
                >
                  Accept & Initiate Deal
                </ModernButton>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

