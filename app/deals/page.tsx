'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function DealsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const deals = [
    {
      id: 1,
      title: 'Electronics Import Deal',
      buyer: 'Tech Corp USA',
      supplier: 'TechManufacture Ltd',
      value: '$250,000',
      status: 'In Negotiation',
      progress: 60,
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Textile Export Order',
      buyer: 'Fashion Retailers EU',
      supplier: 'TextilePro Inc',
      value: '$180,000',
      status: 'Pending Verification',
      progress: 40,
      date: '2024-01-14',
    },
    {
      id: 3,
      title: 'Industrial Materials',
      buyer: 'Manufacturing Ltd',
      supplier: 'RawMaterials Co',
      value: '$420,000',
      status: 'Contract Signed',
      progress: 85,
      date: '2024-01-13',
    },
    {
      id: 4,
      title: 'Machinery Export',
      buyer: 'Factory Systems Inc',
      supplier: 'Industrial Works',
      value: '$320,000',
      status: 'Completed',
      progress: 100,
      date: '2024-01-12',
    },
    {
      id: 5,
      title: 'Chemical Supply Deal',
      buyer: 'Chemical Corp',
      supplier: 'PharmaSupply Ltd',
      value: '$150,000',
      status: 'In Progress',
      progress: 70,
      date: '2024-01-11',
    },
  ];

  const filteredDeals = deals.filter((deal) => {
    if (filterStatus === 'all') return true;
    return deal.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Negotiation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Pending Verification':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contract Signed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Deal Management
          </h1>
          <Link
            href="/deals/new"
            className="px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Deal
          </Link>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto">
          {/* Filters */}
          <div className="mb-6 flex gap-3 flex-wrap">
            {['all', 'In Negotiation', 'Pending Verification', 'Contract Signed', 'Completed'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    filterStatus === status
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface hover:border-primary border border-outline-variant'
                  }`}
                >
                  {status === 'all' ? 'All Deals' : status}
                </button>
              )
            )}
          </div>

          {/* Deals List */}
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="block bg-white rounded-xl border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                      {deal.title}
                    </h3>
                    <div className="flex gap-4 text-sm text-on-surface-variant">
                      <span>Buyer: {deal.buyer}</span>
                      <span>Supplier: {deal.supplier}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-headline font-black text-primary mb-2">
                      {deal.value}
                    </p>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                        deal.status
                      )}`}
                    >
                      {deal.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${deal.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant">
                    {deal.progress}%
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-on-surface-variant mb-4">No deals found</p>
              <Link
                href="/deals/new"
                className="inline-block px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark"
              >
                Create Your First Deal
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
