'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAllDeals, getActiveDeals, mockUsers } from '@/lib/mockData';
import { ModernStatCard } from '@/components/ModernStatCard';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';

export default function AdminDealsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const allDeals = getAllDeals();
  const activeDeals = getActiveDeals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_supplier':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quote_received':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'sample_requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'finalized':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Group deals by status for Kanban view
  const dealsByStatus = {
    new_supplier: allDeals.filter(d => d.status === 'new_supplier'),
    quote_received: allDeals.filter(d => d.status === 'quote_received'),
    negotiation: allDeals.filter(d => d.status === 'negotiation'),
    sample_requested: allDeals.filter(d => d.status === 'sample_requested'),
    finalized: allDeals.filter(d => d.status === 'finalized'),
  };

  const totalValue = allDeals.reduce((sum, d) => sum + d.expectedValue, 0);
  const activeValue = activeDeals.reduce((sum, d) => sum + d.expectedValue, 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new_supplier': return 'info';
      case 'quote_received': return 'primary';
      case 'negotiation': return 'warning';
      case 'sample_requested': return 'success';
      case 'finalized': return 'success';
      case 'cancelled': return 'error';
      default: return 'primary';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary mb-3">
              Deal Pipeline Management
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Monitor all deals and their progression through the sales pipeline
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Deals', value: allDeals.length.toString(), icon: '📊' },
              { label: 'Active Deals', value: activeDeals.length.toString(), icon: '⚡' },
              { label: 'Total Pipeline Value', value: `$${Math.round(totalValue / 1000)}K`, icon: '💰' },
              { label: 'Active Value', value: `$${Math.round(activeValue / 1000)}K`, icon: '💵' },
              { label: 'Conversion Rate', value: `${Math.round((allDeals.filter(d => d.status === 'finalized').length / allDeals.length) * 100)}%`, icon: '📈' },
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

          {/* Kanban View */}
          <div className="mb-8">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">Deal Pipeline Kanban</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {[
                { status: 'new_supplier', label: 'New Supplier', color: 'bg-blue-50' },
                { status: 'quote_received', label: 'Quote Received', color: 'bg-purple-50' },
                { status: 'negotiation', label: 'Negotiation', color: 'bg-orange-50' },
                { status: 'sample_requested', label: 'Sample Requested', color: 'bg-yellow-50' },
                { status: 'finalized', label: 'Finalized', color: 'bg-green-50' },
              ].map(({ status, label, color }) => (
                <div key={status} className={`${color} rounded-xl border border-outline-variant p-4 min-w-80`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline font-bold text-on-surface">{label}</h3>
                    <span className="px-2 py-1 bg-white rounded-full text-sm font-bold text-on-surface">
                      {dealsByStatus[status as keyof typeof dealsByStatus].length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dealsByStatus[status as keyof typeof dealsByStatus].map((deal) => {
                      const buyer = mockUsers.find(u => u.id === deal.buyerId);
                      const seller = mockUsers.find(u => u.id === deal.sellerId);
                      return (
                        <Link
                          key={deal.id}
                          href={`/deals/${deal.id}`}
                          className="block p-3 bg-white rounded-lg border border-outline-variant hover:border-primary hover:shadow-md transition-all"
                        >
                          <p className="font-bold text-on-surface text-sm mb-1">{deal.title}</p>
                          <p className="text-xs text-on-surface-variant mb-2">
                            {buyer?.company.name} → {seller?.company.name}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-primary">
                              ${deal.expectedValue.toLocaleString()}
                            </span>
                            {deal.rmAssignedId && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                RM Assigned
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Deals Table */}
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-4">All Deals</h2>
              <div className="flex gap-4 mb-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none"
                />
                <select className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none">
                  <option>All Status</option>
                  <option>New Supplier</option>
                  <option>Quote Received</option>
                  <option>Negotiation</option>
                  <option>Finalized</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Deal Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Buyer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Seller</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">RM Assigned</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {allDeals.map((deal) => {
                    const buyer = mockUsers.find(u => u.id === deal.buyerId);
                    const seller = mockUsers.find(u => u.id === deal.sellerId);
                    return (
                      <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">{deal.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-on-surface-variant">{buyer?.company.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-on-surface-variant">{seller?.company.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-on-surface">${deal.expectedValue.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(deal.status)}`}>
                            {deal.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-on-surface-variant">
                            {deal.rmAssignedId ? 'Assigned' : 'Not Assigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="text-primary hover:underline text-sm font-bold"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
