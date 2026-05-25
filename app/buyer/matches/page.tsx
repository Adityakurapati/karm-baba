'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mockUsers } from '@/lib/mockData';

export default function SupplierMatchesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  if (isLoading || !user) return null;

  // Show sellers to buyer
  const sellers = mockUsers.filter(u => u.role === 'seller');

  // Simulate match scoring (in real app, would be based on requirements)
  const matchedSellers = sellers.map(seller => ({
    ...seller,
    matchScore: seller.id === 'seller-001' ? 95 : seller.id === 'seller-002' ? 78 : 65,
    relevantProducts: 3,
    avgRating: seller.id === 'seller-001' ? 4.8 : seller.id === 'seller-002' ? 4.2 : 4.0,
  })).sort((a, b) => b.matchScore - a.matchScore);

  // Apply filtering
  const filteredSellers = matchedSellers.filter(seller => {
    const matchesSearch = 
      seller.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.company.industry.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry = 
      selectedIndustry === 'All Industries' || 
      seller.company.industry.toString().toLowerCase().includes(selectedIndustry.toLowerCase().split(' ')[0]);

    let matchesLocation = true;
    if (selectedLocation !== 'All Locations') {
      const loc = seller.company.location.toLowerCase();
      if (selectedLocation === 'India') {
        matchesLocation = loc.includes('india');
      } else if (selectedLocation === 'Europe') {
        matchesLocation = loc.includes('germany') || loc.includes('europe') || loc.includes('berlin');
      } else if (selectedLocation === 'Asia') {
        matchesLocation = loc.includes('india') || loc.includes('china') || loc.includes('japan') || loc.includes('asia');
      }
    }

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout title="Supplier Matches" searchPlaceholder="Search matches...">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              Supplier Matches
            </h1>
            <p className="text-on-surface-variant">
              AI-ranked suppliers matching your requirements
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search suppliers..."
              className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none"
            />
            <select 
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-white font-medium text-sm text-on-surface cursor-pointer"
            >
              <option>All Industries</option>
              <option>Automotive</option>
              <option>Textiles</option>
              <option>Electronics</option>
              <option>Industrial</option>
            </select>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none bg-white font-medium text-sm text-on-surface cursor-pointer"
            >
              <option>All Locations</option>
              <option>India</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>

          {/* Suppliers Grid */}
          {filteredSellers.length === 0 ? (
            <div className="text-center py-16 bg-white border border-outline-variant rounded-2xl">
              <span className="material-symbols-outlined notranslate text-slate-300 text-5xl mb-4" translate="no">person_search</span>
              <h3 className="text-xl font-bold font-headline text-slate-800 mb-1">No matches found</h3>
              <p className="text-slate-500 text-sm">Try relaxing your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-xl border border-outline-variant overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  {/* Header with Match Score */}
                  <div className="p-6 border-b border-outline-variant relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                          {seller.company.name}
                        </h3>
                        <p className="text-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined notranslate text-xs text-slate-400" translate="no">location_on</span>
                          {seller.company.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-headline font-black text-2xl shadow-sm shadow-primary/10">
                          {seller.matchScore}%
                        </div>
                        <p className="text-xs text-on-surface-variant mt-2 font-bold uppercase tracking-tighter">Match Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="p-6 border-b border-outline-variant space-y-3 flex-1">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Industry</p>
                      <p className="font-bold text-on-surface text-sm">{seller.company.industry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-wider">Credibility Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${seller.credibilityScore}%` }}
                          ></div>
                        </div>
                        <span className="font-black text-on-surface text-sm">{seller.credibilityScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-2 uppercase font-bold tracking-wider">Verification</p>
                      <div className="flex flex-wrap gap-2">
                        {seller.verificationBadges.slice(0, 2).map((badge) => (
                          <span
                            key={badge.id}
                            className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined notranslate text-[12px]" translate="no">verified</span>
                            {badge.type.replace('_', ' ').charAt(0).toUpperCase() + badge.type.slice(1).replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Products & Rating */}
                  <div className="p-6 border-b border-outline-variant space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">Products Available</p>
                        <p className="text-2xl font-headline font-black text-on-surface mt-1">
                          {seller.matchScore > 85 ? 8 : seller.matchScore > 70 ? 5 : 3}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.floor(seller.avgRating) ? 'text-amber-400' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm font-black text-on-surface ml-1">
                            {seller.avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 flex gap-3 bg-white">
                    <button
                      onClick={() => router.push(`/buyer/supplier/${seller.id}`)}
                      className="flex-1 px-4 py-2.5 text-center bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors text-sm"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => router.push('/messages')}
                      className="flex-1 px-4 py-2.5 text-center bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors text-sm"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
