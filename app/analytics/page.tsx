'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: 'Total Revenue', value: '$2.45M', change: '+12.5%', icon: '💰' },
    { label: 'Active Deals', value: '24', change: '+8', icon: '📊' },
    { label: 'Network Connections', value: '1,240', change: '+145', icon: '👥' },
    { label: 'Success Rate', value: '92%', change: '+3%', icon: '✓' },
  ];

  const dealsByStatus = [
    { status: 'Completed', count: 45, percentage: 35 },
    { status: 'In Progress', count: 32, percentage: 25 },
    { status: 'Negotiation', count: 28, percentage: 22 },
    { status: 'Pending', count: 24, percentage: 18 },
  ];

  const topPartners = [
    { name: 'Tech Corp USA', deals: 12, revenue: '$450K' },
    { name: 'Global Trade Partners', deals: 18, revenue: '$680K' },
    { name: 'Fashion Retailers EU', deals: 8, revenue: '$320K' },
    { name: 'Manufacturing Ltd', deals: 6, revenue: '$280K' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-4 md:p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl md:text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Analytics & Insights
          </h1>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-outline-variant p-4 md:p-6"
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-on-surface-variant mb-1">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-headline font-black text-on-surface">
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-xl md:text-2xl">{stat.icon}</span>
                </div>
                <p className="text-xs md:text-sm font-bold text-primary">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Deal Status Breakdown */}
            <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-headline font-black text-on-surface mb-4 md:mb-6">
                Deal Status Breakdown
              </h2>
              <div className="space-y-4">
                {dealsByStatus.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-on-surface text-sm md:text-base">{item.status}</p>
                      <p className="text-sm text-on-surface-variant">{item.count} deals</p>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-headline font-black text-on-surface mb-4 md:mb-6">
                Monthly Revenue Trend
              </h2>
              <div className="space-y-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const values = [150, 230, 200, 320, 380, 450];
                  const maxValue = 500;
                  const percentage = (values[i] / maxValue) * 100;
                  return (
                    <div key={month}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-on-surface">{month}</p>
                        <p className="text-sm text-on-surface-variant">${values[i]}K</p>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Partners */}
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-headline font-black text-on-surface mb-4 md:mb-6">
              Top Partners by Revenue
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="px-3 md:px-4 py-3 text-left font-headline font-bold text-on-surface text-sm">
                      Partner Name
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left font-headline font-bold text-on-surface text-sm">
                      Deals
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left font-headline font-bold text-on-surface text-sm">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topPartners.map((partner, i) => (
                    <tr key={i} className="border-b border-outline-variant hover:bg-surface-container">
                      <td className="px-3 md:px-4 py-3 text-on-surface font-bold text-sm">{partner.name}</td>
                      <td className="px-3 md:px-4 py-3 text-on-surface-variant text-sm">{partner.deals}</td>
                      <td className="px-3 md:px-4 py-3 text-primary font-bold text-sm">{partner.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
