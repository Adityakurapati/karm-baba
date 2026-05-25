'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

const campaigns = [
  {
    id: 1,
    name: 'Premium Trade Boost — Textile',
    status: 'Active',
    budget: '$4,200/mo',
    spent: '$2,680',
    reach: '124K',
    clicks: '8,920',
    ctr: '7.2%',
    conversions: 42,
    roi: '+380%',
    trend: 'up',
    channels: ['search', 'social', 'email'],
  },
  {
    id: 2,
    name: 'Global Pharma Sourcing Ads',
    status: 'Active',
    budget: '$6,500/mo',
    spent: '$3,120',
    reach: '89K',
    clicks: '5,430',
    ctr: '6.1%',
    conversions: 28,
    roi: '+210%',
    trend: 'up',
    channels: ['search', 'display'],
  },
  {
    id: 3,
    name: 'Seasonal Electronics Push',
    status: 'Paused',
    budget: '$2,800/mo',
    spent: '$2,800',
    reach: '67K',
    clicks: '3,200',
    ctr: '4.8%',
    conversions: 15,
    roi: '+120%',
    trend: 'down',
    channels: ['social'],
  },
];

export default function PromotionsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'campaigns' | 'creatives'>('overview');

  return (
    <DashboardLayout title="Ads & Promotions" searchPlaceholder="Search campaigns...">


      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Lead Acceleration</span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">Ads &amp; Promotions</h1>
            <p className="text-on-surface-variant text-sm mt-1">Drive qualified trade leads through intelligent campaign management.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-primary text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined notranslate text-base" translate="no">add</span>
              New Campaign
            </button>
            <div className="bg-orange-50 rounded-full p-1 flex">
              {(['overview', 'campaigns', 'creatives'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-colors ${activeView === v ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* KPI Metrics Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spend', value: '$8,600', change: '+12%', icon: 'payments' },
            { label: 'Total Reach', value: '280K', change: '+24%', icon: 'visibility' },
            { label: 'Total Conversions', value: '85', change: '+18%', icon: 'conversion_path' },
            { label: 'Avg. ROI', value: '+237%', change: '+5%', icon: 'trending_up' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="material-symbols-outlined notranslate text-primary text-xl" translate="no">{kpi.icon}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{kpi.change}</span>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl md:text-3xl font-black text-on-surface mt-1">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* Campaign Cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline tracking-tight">Active Campaigns</h2>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              View All <span className="material-symbols-outlined notranslate text-sm" translate="no">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl p-6 border border-outline-variant shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold font-headline truncate group-hover:text-primary transition-colors">{campaign.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {campaign.channels.map((ch) => (
                        <span key={ch} className="text-[9px] font-bold text-primary uppercase bg-orange-50 px-2 py-0.5 rounded">{ch}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Reach</p>
                    <p className="text-sm font-black">{campaign.reach}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Clicks</p>
                    <p className="text-sm font-black">{campaign.clicks}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">CTR</p>
                    <p className="text-sm font-black">{campaign.ctr}</p>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-surface-container-highest overflow-hidden mb-4">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,/mo]/g, ''))) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{campaign.spent} / {campaign.budget}</span>
                  <span className={`text-sm font-black ${campaign.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    ROI {campaign.roi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Chart & AI Insights */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-orange-50/30 border border-orange-100 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight font-headline">Conversion Funnel</h3>
                <p className="text-on-surface-variant text-sm">From impression to qualified trade lead</p>
              </div>
              <div className="flex gap-2">
                {['7D', '30D', '90D'].map((period, i) => (
                  <button key={period} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${i === 1 ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border border-outline-variant/30'}`}>{period}</button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Impressions', value: '280,000', pct: '100%', w: 'w-full' },
                { label: 'Clicks', value: '17,550', pct: '6.3%', w: 'w-4/5' },
                { label: 'Landing Page Views', value: '12,200', pct: '4.4%', w: 'w-3/5' },
                { label: 'Qualified Leads', value: '420', pct: '0.15%', w: 'w-2/5' },
                { label: 'Conversions (Deals)', value: '85', pct: '0.03%', w: 'w-1/5' },
              ].map((step) => (
                <div key={step.label}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-on-surface">{step.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-on-surface">{step.value}</span>
                      <span className="text-[10px] text-slate-400">{step.pct}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full bg-primary rounded-full ${step.w}`} style={{ background: 'linear-gradient(90deg, #e55a24, #ff9500)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-bold font-headline text-sm">AI Campaign Advisor</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-primary uppercase mb-1">Budget Optimization</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your Textile campaign has <span className="font-bold text-primary">36% unused budget</span>. Reallocating $800 to Search ads can yield ~12 more conversions.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Top Performer</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    &ldquo;Pharma Sourcing&rdquo; has the highest CTR at <span className="font-bold text-green-700">6.1%</span>. Consider scaling budget by 20%.
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Keyword Alert</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Bid on &ldquo;raw material sourcing India&rdquo; — CPL is <span className="font-bold text-amber-700">40% below</span> industry average.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
              <h3 className="font-bold font-headline text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no">rocket_launch</span>
                  Boost Top Campaign
                </button>
                <button className="w-full py-3 bg-white border border-outline-variant rounded-xl font-bold text-sm text-on-surface hover:bg-orange-50 transition-colors">
                  A/B Test Creatives
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}
