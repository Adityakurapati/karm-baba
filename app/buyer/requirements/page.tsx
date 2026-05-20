'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

export default function RequirementsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRequirement, setSelectedRequirement] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const requirementsRef = ref(database, 'requirements');
    const q = query(requirementsRef, orderByChild('buyerId'), equalTo(user.id));

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
  }, [user]);

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
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'matched':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter requirements based on search and status
  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'All Status' ||
      req.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
                My Requirements
              </h1>
              <p className="text-on-surface-variant">
                Manage your procurement needs and find suppliers
              </p>
            </div>
            <Link
              href="/buyer/requirements/new"
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
            >
              + Post Requirement
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-white text-on-surface"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-white text-on-surface"
            >
              <option value="All Status">All Status</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRequirements.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">
                  {requirements.length === 0 ? "No requirements yet" : "No matching requirements found"}
                </p>
                {requirements.length === 0 && (
                  <Link
                    href="/buyer/requirements/new"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                  >
                    Post Your First Requirement
                  </Link>
                )}
              </div>
            ) : (
              filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-outline-variant p-5 hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between"
                >
                  {/* Top Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-high text-on-surface rounded truncate max-w-[60%]">
                        {req.category}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(req.status)}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-base font-headline font-bold text-on-surface mb-2 line-clamp-2 leading-snug" title={req.title}>
                      {req.title}
                    </h3>
                    <p className="text-on-surface-variant text-xs line-clamp-3 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-outline-variant flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedRequirement(req)}
                      className="w-full px-3 py-2 text-center text-xs bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                    >
                      View Detailed Requirement
                    </button>
                    {req.status === 'matched' && (
                      <Link
                        href={`/buyer/matches?req=${req.id}`}
                        className="w-full px-3 py-2 text-center text-xs bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                      >
                        View Suppliers
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedRequirement.status)}`}>
                    {selectedRequirement.status.charAt(0).toUpperCase() + selectedRequirement.status.slice(1)}
                  </span>
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
                  className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-colors"
                >
                  Close
                </button>
                {selectedRequirement.status === 'matched' && (
                  <Link
                    href={`/buyer/matches?req=${selectedRequirement.id}`}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors text-center"
                    onClick={() => setSelectedRequirement(null)}
                  >
                    View Suppliers
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

