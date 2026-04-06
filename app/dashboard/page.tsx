'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {

  // Mock data
  const deals = [
    {
      id: 1,
      title: 'Electronics Import Deal',
      buyer: 'Tech Corp USA',
      value: '$250,000',
      status: 'In Negotiation',
      progress: 60,
    },
    {
      id: 2,
      title: 'Textile Export Order',
      buyer: 'Fashion Retailers EU',
      value: '$180,000',
      status: 'Pending Verification',
      progress: 40,
    },
    {
      id: 3,
      title: 'Industrial Materials',
      buyer: 'Manufacturing Ltd',
      value: '$420,000',
      status: 'Contract Signed',
      progress: 85,
    },
  ];

  const leads = [
    { id: 1, company: 'Global Tech Solutions', score: 92, status: 'Hot Lead' },
    { id: 2, company: 'Export Traders Inc', score: 78, status: 'Warm Lead' },
    { id: 3, company: 'Import Partners LLC', score: 65, status: 'Warm Lead' },
  ];

  return (
    <DashboardLayout>
      <header className="bg-slate-50/80 backdrop-blur-md flex justify-between items-center h-14 md:h-16 px-4 md:px-8 border-b border-slate-200/20">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
            placeholder="Search accounts, deals, or documents..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4 md:gap-6 ml-4 flex-shrink-0">
          <button className="text-slate-500 hover:text-slate-900">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold">
            U
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
              Welcome back, User!
            </h1>
            <p className="text-on-surface-variant">
              Here's what's happening with your deals and network
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Deals', value: '12', icon: '📊' },
              { label: 'Pending Leads', value: '24', icon: '👥' },
              { label: 'This Month Revenue', value: '$450K', icon: '💰' },
              { label: 'Network Size', value: '1,240', icon: '🌍' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors"
              >
                <p className="text-sm text-on-surface-variant mb-2">{stat.label}</p>
                <p className="text-2xl font-headline font-black text-on-surface">
                  {stat.value}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            ))}
          </div>

          {/* Deals Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-outline-variant p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-headline font-black text-on-surface">
                    Active Deals
                  </h2>
                  <Link
                    href="/deals"
                    className="text-primary hover:text-primary-dark font-bold text-sm"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-headline font-bold text-on-surface">
                            {deal.title}
                          </h3>
                          <p className="text-sm text-on-surface-variant">
                            {deal.buyer}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {deal.value}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="w-full bg-surface-container rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${deal.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant ml-3">
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-primary text-white rounded-xl p-6">
                <h3 className="font-headline font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/deals/new"
                    className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center font-bold"
                  >
                    Create Deal
                  </Link>
                  <Link
                    href="/network"
                    className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center font-bold"
                  >
                    Find Partners
                  </Link>
                  <Link
                    href="/analytics"
                    className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center font-bold"
                  >
                    Analytics
                  </Link>
                </div>
              </div>

              {/* Top Leads */}
              <div className="bg-white rounded-xl border border-outline-variant p-6">
                <h3 className="font-headline font-bold text-on-surface mb-4">
                  Top Leads
                </h3>
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface">
                          {lead.company}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Score: {lead.score}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <h2 className="text-xl font-headline font-black text-on-surface mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[
                'Deal negotiation started with Tech Corp USA',
                'Your documents have been verified',
                'New lead: Fashion Retailers EU',
                'Payment received for Electronics Import Deal',
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-outline-variant last:border-b-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-on-surface-variant">{activity}</p>
                </div>
              ))}
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
