'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mockUsers } from '@/lib/mockData';

export default function SupplierMatchesPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  // Show sellers to buyer
  const sellers = mockUsers.filter(u => u.role === 'seller');

  // Simulate match scoring (in real app, would be based on requirements)
  const matchedSellers = sellers.map(seller => ({
    ...seller,
    matchScore: Math.floor(Math.random() * 40 + 60), // 60-100
    relevantProducts: 3,
    avgRating: 4 + Math.random() * 1,
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
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
              placeholder="Search suppliers..."
              className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none"
            />
            <select className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none">
              <option>All Industries</option>
              <option>Automotive</option>
              <option>Textiles</option>
              <option>Electronics</option>
              <option>Industrial</option>
            </select>
            <select className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none">
              <option>All Locations</option>
              <option>India</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-xl border border-outline-variant overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header with Match Score */}
                <div className="p-6 border-b border-outline-variant relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                        {seller.company.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {seller.company.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-headline font-black text-2xl">
                        {seller.matchScore}%
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Match Score</p>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="p-6 border-b border-outline-variant space-y-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Industry</p>
                    <p className="font-bold text-on-surface">{seller.company.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Credibility Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${seller.credibilityScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{seller.credibilityScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">Verification</p>
                    <div className="flex flex-wrap gap-2">
                      {seller.verificationBadges.slice(0, 2).map((badge) => (
                        <span
                          key={badge.id}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold"
                        >
                          ✓ {badge.type.replace('_', ' ').charAt(0).toUpperCase() + badge.type.slice(1).replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Products & Rating */}
                <div className="p-6 border-b border-outline-variant space-y-3">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">Products Available</p>
                    <p className="text-2xl font-headline font-black text-on-surface">
                      {seller.matchScore > 85 ? 8 : seller.matchScore > 70 ? 5 : 3}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(seller.avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm font-bold text-on-surface ml-2">
                        {seller.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3">
                  <Link
                    href={`/buyer/supplier/${seller.id}`}
                    className="flex-1 px-4 py-2 text-center bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                  >
                    View Profile
                  </Link>
                  <button className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
