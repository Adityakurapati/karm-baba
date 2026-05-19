'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <TopHeader title="Executive Intelligence" searchPlaceholder="Search intelligence data..." />

      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        {/* Hero Intelligence Section */}
        <section className="flex flex-col md:flex-row gap-6">
          {/* AI HUD Card */}
          <div className="flex-1 p-[1px] rounded-3xl" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9500)' }}>
            <div className="bg-white h-full w-full rounded-[23px] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined notranslate text-[120px]" translate="no">bolt</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="bg-orange-100 text-primary text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">KARM Intelligence</span>
                  <span className="text-on-surface-variant text-xs">• Just Updated</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 max-w-lg">Next Best Action: Reallocate Textile Sourcing to Vietnam</h2>
                <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                  Supply chain signals indicate a <span className="text-primary font-bold">15% price drop</span> in high-grade textiles in Vietnam due to regional output expansion. Execution window closes in 48 hours.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button className="bg-primary text-white rounded-full px-6 py-3 font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    Analyze Impact <span className="material-symbols-outlined notranslate text-sm" translate="no">trending_up</span>
                  </button>
                  <button className="text-primary font-bold border border-primary/20 rounded-full px-6 py-3 hover:bg-orange-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Snapshot Stats */}
          <div className="grid grid-cols-1 gap-4 w-full md:w-80">
            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex flex-col justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Market Sentiment</span>
              <div className="text-3xl font-black text-primary mt-2">Bullish</div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-4/5"></div>
              </div>
            </div>
            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl flex flex-col justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Risk Exposure</span>
              <div className="text-3xl font-black text-green-600 mt-2">Low</div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-1/5"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Demand Trends & Market Opportunity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trade Intensity */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-outline-variant shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-headline">Global Trade Intensity</h3>
                <p className="text-on-surface-variant text-sm">Region-based real-time volume heatmap</p>
              </div>
              <div className="flex bg-orange-50 rounded-full p-1">
                <button className="bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">Volume</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant">Growth</button>
              </div>
            </div>
            <div className="h-[300px] md:h-[400px] w-full rounded-2xl bg-orange-50/30 relative flex items-center justify-center overflow-hidden border border-orange-100">
              <div className="text-center">
                <span className="material-symbols-outlined notranslate text-primary text-6xl" translate="no">public</span>
                <p className="text-sm font-bold text-on-surface-variant mt-4">Global Trade Heatmap</p>
                <p className="text-xs text-on-surface-variant mt-1">Real-time trade volume visualization</p>
              </div>
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 p-4 bg-white/80 backdrop-blur border border-outline-variant/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-[10px] font-bold">ASEAN: +22%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-bold">LATAM: +14%</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Growth Sector Insights */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-orange-50 border border-orange-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined notranslate" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Market Opportunity</h3>
              </div>
              <div className="space-y-4 md:space-y-6">
                {[
                  { name: 'Lithium Carbonate', change: '+18.5%', desc: 'High demand spike in EV battery manufacturing hubs in Eastern Europe. Recommend inventory hedge.' },
                  { name: 'Sustainable Textiles', change: '+12.2%', desc: 'Nordic apparel markets opening quotas for recycled synthetics. Supply chain pivot suggested.' },
                  { name: 'Smart Logistics', change: '-2.4%', negative: true, desc: 'Consolidation in freight tech expected. Monitor M&A signals in North America.' },
                ].map((item) => (
                  <div key={item.name} className="bg-white/50 p-4 rounded-2xl border border-white/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{item.name}</span>
                      <span className={`text-xs font-black ${item.negative ? 'text-amber-600' : 'text-green-600'}`}>{item.change}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Price Benchmarking & Shipment Tracking */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price Benchmarking */}
          <div className="bg-orange-50/30 border border-orange-100 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-headline">Price Benchmarking</h3>
                <p className="text-on-surface-variant text-sm">Global average vs. Premium procurement</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Index
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Market
                </span>
              </div>
            </div>
            <div className="h-64 flex items-end gap-2 relative">
              <div className="absolute inset-0 border-b border-l border-slate-200/50 flex flex-col justify-between py-2 pr-2">
                <div className="w-full border-t border-slate-100 h-0"></div>
                <div className="w-full border-t border-slate-100 h-0"></div>
                <div className="w-full border-t border-slate-100 h-0"></div>
              </div>
              {[
                { month: 'JAN', h1: 'h-32', h2: 'h-24' },
                { month: 'FEB', h1: 'h-40', h2: 'h-28' },
                { month: 'MAR', h1: 'h-48', h2: 'h-36' },
                { month: 'APR', h1: 'h-44', h2: 'h-32' },
                { month: 'MAY', h1: 'h-56', h2: 'h-40' },
                { month: 'JUN', h1: 'h-60', h2: 'h-48' },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center justify-end group gap-1">
                  <div className={`w-full bg-primary/20 rounded-t-lg ${bar.h1} group-hover:bg-primary/40 transition-colors`}></div>
                  <div className={`w-full bg-primary rounded-t-lg ${bar.h2}`}></div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Tracking */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight font-headline">Shipment Tracking</h3>
                <p className="text-on-surface-variant text-sm">High-level competitor movement by volume</p>
              </div>
              <button className="text-primary text-xs font-bold underline">Export Report</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
                    <th className="pb-4">Competitor</th>
                    <th className="pb-4">Origin</th>
                    <th className="pb-4 hidden sm:table-cell">Volume (TEU)</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {[
                    { name: 'Apex Logistics Corp', origin: 'Shanghai, CN', vol: '12,450', status: 'Transit', color: 'green' },
                    { name: 'Meridian Trade Group', origin: 'Rotterdam, NL', vol: '8,920', status: 'Loading', color: 'blue' },
                    { name: 'Global Sourcing Ltd', origin: 'Santos, BR', vol: '15,100', status: 'Delayed', color: 'amber' },
                    { name: 'Zenith Exports', origin: 'Singapore, SG', vol: '22,300', status: 'Arrived', color: 'green' },
                  ].map((row) => (
                    <tr key={row.name} className="group hover:bg-orange-50/50 transition-colors">
                      <td className="py-4 font-bold">{row.name}</td>
                      <td className="py-4 text-on-surface-variant">{row.origin}</td>
                      <td className="py-4 hidden sm:table-cell">{row.vol}</td>
                      <td className="py-4">
                        <span className={`flex items-center gap-2 text-${row.color}-600`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${row.color}-600`}></span> {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
