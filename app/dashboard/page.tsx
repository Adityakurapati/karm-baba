'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="KARM BABA Dashboard" searchPlaceholder="Search deals, leads, or documents...">


        <main className="flex-1 overflow-auto p-4 md:p-8">
          {/* Top App Bar Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Execution Context</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight font-headline">KARM BABA Dashboard</h1>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant">Deal ID</span>
                <p className="font-bold text-primary">#KB-8829</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant">Deal Value</span>
                <p className="font-bold text-primary">$42,500 USD</p>
              </div>
              <Link href="/deals/new" className="text-white px-5 py-2 rounded-full font-headline text-sm font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20" style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}>
                <span className="material-symbols-outlined notranslate text-sm" translate="no">add</span>
                Create Deal
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-8">
            {/* Center Column (Execution Module) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Deal Timeline Module */}
              <section className="bg-orange-50/30 border border-orange-100 rounded-xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3">
                  <div>
                    <h3 className="font-headline text-xl md:text-2xl font-bold tracking-tight">Execution Timeline</h3>
                    <p className="text-on-surface-variant text-sm">Milestone tracking for KB-8829</p>
                  </div>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Negotiation Active</span>
                </div>
                <div className="relative flex justify-between">
                  <div className="absolute top-4 left-0 w-full h-[2px] bg-outline-variant/30 z-0"></div>
                  <div className="absolute top-4 left-0 w-[50%] h-[2px] bg-primary z-0"></div>
                  {[
                    { label: 'Lead', done: true, icon: 'check' },
                    { label: 'Quotation', done: true, icon: 'check' },
                    { label: 'Negotiation', active: true, icon: 'sync' },
                    { label: 'Shipment', icon: 'local_shipping' },
                    { label: 'Closed', icon: 'verified' },
                  ].map((step) => (
                    <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.done ? 'bg-primary text-white' :
                        step.active ? 'bg-white border-2 border-primary text-primary ring-4 ring-primary/10' :
                        'bg-white border-2 border-outline-variant text-slate-400'
                      }`}>
                        <span className="material-symbols-outlined notranslate text-sm" translate="no" style={step.done ? { fontVariationSettings: "'FILL' 1" } : {}}>{step.icon}</span>
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-tighter ${step.active ? 'text-primary' : step.done ? '' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Proforma Invoice Generator */}
              <section className="bg-white rounded-xl p-6 md:p-8 border border-outline-variant shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
                  <h3 className="font-headline text-xl font-bold tracking-tight">Proforma Invoice Generator</h3>
                  <button className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-colors">
                    <span className="material-symbols-outlined notranslate text-sm" translate="no">bolt</span>
                    AI Pricing Suggestions
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase px-1">Buyer Entity</span>
                    <div className="mt-1 bg-orange-50/30 px-4 py-3 rounded-lg text-on-surface font-semibold">Global Trade Corp</div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase px-1">Seller Entity</span>
                    <div className="mt-1 bg-orange-50/30 px-4 py-3 rounded-lg text-on-surface font-semibold">Nexus Logistics</div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-outline-variant/20">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-orange-50/50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Product Description</th>
                        <th className="px-4 py-3">HS Code</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Quantity</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      <tr>
                        <td className="px-4 py-4 font-medium">Industrial Grade Polymer Resin</td>
                        <td className="px-4 py-4"><span className="bg-orange-50 text-primary px-2 py-1 rounded font-mono text-xs">2933.39</span></td>
                        <td className="px-4 py-4 hidden sm:table-cell">50,000 kg</td>
                        <td className="px-4 py-4 text-right">$0.85</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-medium">Custom Pallet Packaging</td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-400">4415.20</td>
                        <td className="px-4 py-4 hidden sm:table-cell">120 Units</td>
                        <td className="px-4 py-4 text-right">$0.00 <span className="text-[9px] text-slate-400 italic">(Incld)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Logistics & Document Center */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-6">
                  <h4 className="font-headline text-lg font-bold mb-4">Logistics Calculator</h4>
                  <div className="flex gap-2 mb-6">
                    {['FOB', 'CIF', 'EXW'].map((term, i) => (
                      <button key={term} className={`flex-1 py-2 rounded-lg text-[11px] font-bold ${i === 0 ? 'bg-primary text-white' : 'bg-white border border-outline-variant/30 text-slate-600'}`}>{term}</button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Freight Quote (Ocean)</span>
                      <span className="font-bold text-on-surface">$2,450.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Insurance (0.5%)</span>
                      <span className="font-bold text-on-surface">$212.50</span>
                    </div>
                    <div className="h-px bg-outline-variant/20 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">Total Landed</span>
                      <span className="font-black text-on-surface">$45,162.50</span>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-6">
                  <h4 className="font-headline text-lg font-bold mb-4">Document Repository</h4>
                  <ul className="space-y-3">
                    {[
                      { icon: 'description', name: 'Commercial Invoice', action: 'download' },
                      { icon: 'package_2', name: 'Packing List', action: 'download' },
                      { icon: 'edit_document', name: 'Bill of Lading', action: 'sign', highlight: true },
                    ].map((doc) => (
                      <li key={doc.name} className={`flex items-center justify-between p-2 rounded-lg ${doc.highlight ? 'bg-white border border-orange-200' : 'bg-white/50 border border-white'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined notranslate text-lg ${doc.highlight ? 'text-primary' : 'text-primary'}`} translate="no">{doc.icon}</span>
                          <span className="text-xs font-bold text-on-surface">{doc.name}</span>
                        </div>
                        {doc.action === 'sign' ? (
                          <span className="text-[9px] font-bold text-primary uppercase">Need Sign</span>
                        ) : (
                          <button className="material-symbols-outlined notranslate text-slate-400 text-lg hover:text-primary" translate="no">download</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* Right Panel (Contextual Sidebar) */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
              {/* Executive Actions */}
              <section className="text-white rounded-xl p-6 md:p-8 shadow-xl" style={{ background: '#1a1a2e' }}>
                <h3 className="font-headline text-lg font-bold mb-6 tracking-tight">Executive Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}>
                    <span className="material-symbols-outlined notranslate" translate="no">verified</span>
                    Approve Invoice
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-slate-800 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined notranslate text-sm" translate="no">share</span>PDF
                    </button>
                    <button className="bg-slate-800 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined notranslate text-sm" translate="no">chat</span>WhatsApp
                    </button>
                  </div>
                  <button className="w-full bg-white/5 border border-white/10 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    Update Deal Stage
                  </button>
                </div>
              </section>

              {/* Smart Intelligence */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <h3 className="font-headline text-sm font-black uppercase tracking-widest text-slate-500">Smart Intelligence</h3>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined notranslate text-red-500 text-lg" translate="no">warning</span>
                    <div>
                      <h4 className="text-xs font-black text-red-800">HS Code Mismatch Detected</h4>
                      <p className="text-[11px] text-red-700/80 mt-1">HS Code 2933.39 for &apos;Polymer Resin&apos; differs from previous filings (2933.31).</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Next Best Action</span>
                  <p className="text-sm font-medium text-on-surface leading-relaxed">
                    Based on negotiation history, the buyer is ready for finalization.
                    <span className="text-primary font-bold"> Send finalized Proforma to Buyer</span> to secure the shipment slot.
                  </p>
                </div>
              </section>

              {/* Map Integration */}
              <section className="bg-orange-50/30 border border-orange-100 rounded-xl overflow-hidden h-48 relative">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined notranslate text-primary text-3xl" translate="no">location_on</span>
                    <p className="text-[10px] font-bold text-slate-500 mt-2">Transit: Port of Rotterdam</p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
