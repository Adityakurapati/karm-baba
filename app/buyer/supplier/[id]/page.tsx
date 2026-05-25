'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mockUsers, mockProducts } from '@/lib/mockData';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierProfilePage({ params }: PageProps) {
  const { id: supplierId } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'verification'>('overview');

  if (isLoading || !user) return null;

  // Find the supplier
  const supplier = mockUsers.find(u => u.id === supplierId && u.role === 'seller');

  if (!supplier) {
    return (
      <ProtectedRoute allowedRoles={['buyer']}>
        <DashboardLayout title="Supplier Profile">
          <div className="flex-1 p-8 text-center">
            <h2 className="text-2xl font-bold font-headline text-red-500 mb-2">Supplier Not Found</h2>
            <Link href="/buyer/matches" className="text-primary font-bold hover:underline">
              Back to Matches
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Get products of this supplier
  const supplierProducts = mockProducts.filter(p => p.sellerId === supplier.id);

  // Dynamic values
  const matchScore = supplier.id === 'seller-001' ? 95 : supplier.id === 'seller-002' ? 78 : 65;
  const avgRating = supplier.id === 'seller-001' ? 4.8 : supplier.id === 'seller-002' ? 4.2 : 4.0;

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout title={`${supplier.company.name} - Profile`} searchPlaceholder="Search inside profile...">
        <div className="flex-1 overflow-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Back Navigation */}
          <button 
            onClick={() => router.push('/buyer/matches')}
            className="flex items-center gap-2 text-primary font-bold hover:underline mb-6 text-sm"
          >
            <span className="material-symbols-outlined notranslate text-sm" translate="no">arrow_back</span>
            Back to Supplier Matches
          </button>

          {/* Premium Profile Hero Card */}
          <div className="bg-white rounded-3xl border border-outline-variant p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full opacity-[0.03] pointer-events-none bg-primary" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-headline font-black text-3xl shadow-sm border border-primary/20 shrink-0">
                  {supplier.company.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-2xl md:text-3xl font-black font-headline text-on-surface">
                      {supplier.company.name}
                    </h1>
                    <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined notranslate text-[12px] filled" translate="no">verified</span>
                      Karm Baba Verified
                    </span>
                  </div>
                  <p className="text-on-surface-variant flex items-center gap-1.5 text-sm font-medium">
                    <span className="material-symbols-outlined notranslate text-sm text-slate-400" translate="no">location_on</span>
                    {supplier.company.location}
                  </p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">work</span>
                      {supplier.company.industry}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">groups</span>
                      {supplier.company.employees} Employees
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">calendar_month</span>
                      Est. {supplier.company.yearEstablished}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Match Score */}
              <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t border-outline-variant/30 lg:border-t-0 pt-6 lg:pt-0 shrink-0">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-headline font-black text-2xl shadow-sm shadow-primary/20">
                    {matchScore}%
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-bold uppercase tracking-wider">AI Match Score</p>
                </div>
                <div className="flex flex-col gap-2 w-48">
                  <button 
                    onClick={() => router.push('/messages')}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <span className="material-symbols-outlined notranslate text-sm" translate="no">chat</span>
                    Contact Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="flex gap-6 border-b border-outline-variant pb-4 mb-8 overflow-x-auto">
            {(['overview', 'catalog', 'verification'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-headline font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'catalog' ? `Product Catalog (${supplierProducts.length})` : 'Verification & Trust'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Detailed stats */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-2xl border border-outline-variant p-6 md:p-8 space-y-6">
                    <h3 className="text-xl font-headline font-black text-on-surface">About the Company</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      {supplier.company.name} is a premier verified merchant in the global trade arena. Specializing in high-standard B2B commerce and logistics execution, we maintain a robust operational framework to deliver world-class products. With a commitment to quality standards and seamless logistics execution, we support trade pipelines globally.
                    </p>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Website</span>
                        <a href={`https://${supplier.company.website}`} target="_blank" rel="noreferrer" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                          {supplier.company.website || 'Not Specified'}
                          <span className="material-symbols-outlined notranslate text-xs" translate="no">open_in_new</span>
                        </a>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Company Status</span>
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Risk & Ratings */}
                <div className="space-y-8">
                  {/* Rating & Trust Metrics */}
                  <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-5">
                    <h3 className="text-lg font-headline font-black text-on-surface">Trust Score & Ratings</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-headline font-black text-on-surface">
                        {avgRating.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-lg">{i < Math.floor(avgRating) ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span className="text-xs text-on-surface-variant font-bold">12 Verified Reviews</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
                          <span>Credibility Score</span>
                          <span>{supplier.credibilityScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${supplier.credibilityScore}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-bold text-on-surface-variant">Risk Factor Assessment</span>
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded border ${
                          supplier.riskLevel === 'low' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                        }`}>{supplier.riskLevel} Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
              <div>
                <h3 className="text-xl font-headline font-black text-on-surface mb-6">Available Trade Catalog</h3>
                {supplierProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-outline-variant rounded-2xl">
                    <span className="material-symbols-outlined notranslate text-slate-300 text-5xl mb-4" translate="no">shopping_bag</span>
                    <h3 className="text-lg font-bold font-headline text-slate-800 mb-1">No products listed</h3>
                    <p className="text-slate-500 text-sm">This supplier has not posted products in their catalog yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {supplierProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl border border-outline-variant overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-headline font-black text-lg text-on-surface group-hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-xs text-on-surface-variant mt-1 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded w-fit uppercase">
                                {product.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-headline font-black text-primary block">
                                ${product.basePrice}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-bold">Base Unit Price ({product.currency})</span>
                            </div>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {product.description}
                          </p>

                          {/* Technical Specifications */}
                          <div className="pt-4 border-t border-outline-variant/30 space-y-2">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Technical Specs</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(product.specifications).map(([key, val]) => (
                                <div key={key} className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                                  <span className="text-[10px] text-slate-400 capitalize block">{key.replace('_', ' ')}</span>
                                  <span className="font-bold text-on-surface mt-0.5 block">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Trade & Order Terms */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/30 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">Min Order Qty</span>
                            <span className="font-black text-on-surface mt-0.5 block">{product.minimumOrderQuantity.toLocaleString()} Units</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">Shipping Terms</span>
                            <span className="font-black text-on-surface mt-0.5 block">{product.shippingTerms}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">Production Lead Time</span>
                            <span className="font-black text-on-surface mt-0.5 block">{product.leadTime} Days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="bg-white rounded-2xl border border-outline-variant p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-headline font-black text-on-surface">Compliance &amp; Badges</h3>
                <p className="text-on-surface-variant text-sm">
                  This supplier is fully compliant with standard global trade protocols. The following credentials and regulatory records have been verified by our platform:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {supplier.verificationBadges.map((badge) => (
                    <div key={badge.id} className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined notranslate text-xl" translate="no">verified</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-emerald-800 uppercase tracking-tight text-sm">
                          {badge.type.replace('_', ' ').charAt(0).toUpperCase() + badge.type.slice(1).replace('_', ' ')} Verified
                        </h4>
                        <p className="text-xs text-emerald-700/80 font-bold mt-1">Credential: {badge.number}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Verified by {badge.verifiedBy || 'KARM BABA'} • Issued on {new Date(badge.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
