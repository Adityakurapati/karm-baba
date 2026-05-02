'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAllDeals, mockUsers } from '@/lib/mockData';

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const allDeals = getAllDeals();
  const buyers = mockUsers.filter(u => u.role === 'buyer');
  const sellers = mockUsers.filter(u => u.role === 'seller');

  const totalValue = allDeals.reduce((sum, d) => sum + d.expectedValue, 0);
  const avgDealValue = allDeals.length > 0 ? totalValue / allDeals.length : 0;
  const completedDeals = allDeals.filter(d => d.status === 'finalized').length;
  const conversionRate = allDeals.length > 0 ? (completedDeals / allDeals.length) * 100 : 0;

  const avgBuyerCredibility = buyers.length > 0 ? buyers.reduce((sum, b) => sum + b.credibilityScore, 0) / buyers.length : 0;
  const avgSellerCredibility = sellers.length > 0 ? sellers.reduce((sum, s) => sum + s.credibilityScore, 0) / sellers.length : 0;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              Platform Analytics
            </h1>
            <p className="text-on-surface-variant">
              Key metrics and insights about platform performance
            </p>
          </div>

          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Users',
                value: mockUsers.filter(u => u.role !== 'admin').length.toString(),
                subtitle: `${buyers.length} Buyers • ${sellers.length} Sellers`,
                icon: '👥',
              },
              {
                label: 'Total Deals',
                value: allDeals.length.toString(),
                subtitle: `${completedDeals} Completed`,
                icon: '📊',
              },
              {
                label: 'Platform Revenue',
                value: `$${Math.round(totalValue / 1000)}K`,
                subtitle: `Avg: $${Math.round(avgDealValue / 1000)}K`,
                icon: '💰',
              },
              {
                label: 'Conversion Rate',
                value: `${conversionRate.toFixed(1)}%`,
                subtitle: `${completedDeals} of ${allDeals.length} deals`,
                icon: '📈',
              },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-on-surface-variant mb-1">{kpi.label}</p>
                    <p className="text-3xl font-headline font-black text-on-surface">
                      {kpi.value}
                    </p>
                  </div>
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
                <p className="text-xs text-on-surface-variant">{kpi.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* User Credibility */}
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">
                User Credibility Scores
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-bold text-on-surface">Buyers Average</p>
                    <p className="text-sm font-bold text-primary">
                      {Math.round(avgBuyerCredibility)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${avgBuyerCredibility}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-bold text-on-surface">Sellers Average</p>
                    <p className="text-sm font-bold text-primary">
                      {Math.round(avgSellerCredibility)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${avgSellerCredibility}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Status Distribution */}
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">
                Deal Status Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'New Supplier', count: allDeals.filter(d => d.status === 'new_supplier').length, color: 'bg-blue-500' },
                  { label: 'Quote Received', count: allDeals.filter(d => d.status === 'quote_received').length, color: 'bg-purple-500' },
                  { label: 'Negotiation', count: allDeals.filter(d => d.status === 'negotiation').length, color: 'bg-orange-500' },
                  { label: 'Sample Requested', count: allDeals.filter(d => d.status === 'sample_requested').length, color: 'bg-yellow-500' },
                  { label: 'Finalized', count: completedDeals, color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-bold text-on-surface">{item.label}</p>
                      <p className="text-sm font-bold text-on-surface-variant">{item.count}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${allDeals.length > 0 ? (item.count / allDeals.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">
                Verification Status
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Verified Users',
                    value: mockUsers.filter(u => u.verificationStatus === 'verified').length,
                    color: 'bg-green-100 text-green-800',
                    icon: '✅',
                  },
                  {
                    label: 'Pending Approval',
                    value: mockUsers.filter(u => u.verificationStatus === 'pending').length,
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: '⏳',
                  },
                  {
                    label: 'Rejected',
                    value: mockUsers.filter(u => u.verificationStatus === 'rejected').length,
                    color: 'bg-red-100 text-red-800',
                    icon: '❌',
                  },
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-lg ${stat.color}`}>
                    <div className="flex justify-between items-center">
                      <p className="font-bold">{stat.label}</p>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-headline font-black mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Sellers */}
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">
                Top Sellers (by Deal Value)
              </h3>
              <div className="space-y-3">
                {sellers
                  .map(seller => ({
                    seller,
                    dealValue: allDeals
                      .filter(d => d.sellerId === seller.id)
                      .reduce((sum, d) => sum + d.expectedValue, 0),
                  }))
                  .sort((a, b) => b.dealValue - a.dealValue)
                  .slice(0, 5)
                  .map((item, idx) => (
                    <div key={item.seller.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
                      <div>
                        <p className="font-bold text-on-surface">
                          {idx + 1}. {item.seller.company.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {allDeals.filter(d => d.sellerId === item.seller.id).length} deals
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        ${Math.round(item.dealValue / 1000)}K
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Buyers */}
            <div className="bg-white rounded-xl border border-outline-variant p-6">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">
                Top Buyers (by Deal Value)
              </h3>
              <div className="space-y-3">
                {buyers
                  .map(buyer => ({
                    buyer,
                    dealValue: allDeals
                      .filter(d => d.buyerId === buyer.id)
                      .reduce((sum, d) => sum + d.expectedValue, 0),
                  }))
                  .sort((a, b) => b.dealValue - a.dealValue)
                  .slice(0, 5)
                  .map((item, idx) => (
                    <div key={item.buyer.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
                      <div>
                        <p className="font-bold text-on-surface">
                          {idx + 1}. {item.buyer.company.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {allDeals.filter(d => d.buyerId === item.buyer.id).length} deals
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        ${Math.round(item.dealValue / 1000)}K
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
