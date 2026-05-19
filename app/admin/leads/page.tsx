import React from "react";

export default function LeadScoring() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Lead Scoring</h2>
          <p className="text-on-surface-variant font-medium mt-2 max-w-2xl">Configure AI parameters to prioritize high-velocity institutional opportunities based on proprietary weighted logic and historical execution data.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-full font-headline font-bold text-sm bg-surface-container-highest text-primary hover:bg-surface-container-high transition-colors">Export Logic</button>
          <button className="px-6 py-2.5 rounded-full font-headline font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:scale-105 transition-transform">Run Recalibration</button>
        </div>
      </div>

      {/* Bento Layout Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* AI Prediction Accuracy */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined notranslate text-tertiary bg-tertiary-container/10 p-2 rounded-lg" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary/70">AI Prediction</span>
          </div>
          <div className="space-y-1">
            <p className="text-on-surface-variant text-sm font-semibold">Model Confidence</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-headline font-extrabold text-on-surface">94.8%</h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center">+1.2% <span className="material-symbols-outlined notranslate text-xs" translate="no">north</span></span>
            </div>
          </div>
          <div className="mt-6 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: "94.8%" }}></div>
          </div>
          <p className="mt-3 text-[11px] text-on-surface-variant/60 font-medium uppercase tracking-tight">Recalibrated 2 hours ago based on Deal Flux</p>
        </div>

        {/* Weighted Parameters */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined notranslate text-primary" translate="no">tune</span>
            Scoring Weights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { label: "Annual Turnover", weight: "40%" },
              { label: "Industry Vertical", weight: "25%" },
              { label: "Region Stability", weight: "15%" },
              { label: "Verification Status", weight: "20%" },
            ].map((param, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-on-surface">{param.label}</label>
                  <span className="text-xs font-black text-primary">{param.weight}</span>
                </div>
                <div className="relative h-1.5 w-full bg-surface-container-high rounded-lg overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-primary/10"></div>
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: param.weight }}></div>
                  <div className="absolute top-0 right-0 h-full w-2 bg-primary shadow-[0_0_10px_var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-tight">
                  <span>Low Weight</span>
                  <span>Critical</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Distribution Curve */}
        <div className="col-span-12 bg-surface-container-low p-8 rounded-xl overflow-hidden relative border border-outline-variant/15">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface">Lead Distribution Curve</h3>
              <p className="text-xs text-on-surface-variant font-medium">Population density vs. Intelligence Score</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/30"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Market Average</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">KARM Current</span>
              </div>
            </div>
          </div>
          <div className="relative h-48 w-full flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path className="text-primary/20" d="M0,100 C100,100 200,95 300,80 C400,60 500,20 600,20 C700,20 800,70 900,90 C950,95 1000,100 1000,100" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <path d="M0,100 C100,100 200,90 300,70 C400,40 500,10 600,10 C700,10 800,50 900,85 C950,92 1000,100 1000,100" fill="url(#grad1)" stroke="none"></path>
              <defs>
                <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path className="text-primary" d="M0,100 C100,100 200,90 300,70 C400,40 500,10 600,10 C700,10 800,50 900,85 C950,92 1000,100 1000,100" fill="none" stroke="currentColor" strokeWidth="3"></path>
              <circle className="fill-primary" cx="600" cy="10" r="4"></circle>
            </svg>
            <div className="absolute left-[58%] bottom-full mb-2 translate-x-1 text-center">
              <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">Target: 82.4</span>
            </div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest border-t border-outline-variant/10 pt-4">
            <span>Low Potential (0-30)</span>
            <span>Emerging (31-60)</span>
            <span>High Priority (61-85)</span>
            <span>Strategic (86-100)</span>
          </div>
        </div>

        {/* Top Scored Opportunities Table */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
          <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
            <h3 className="text-lg font-headline font-bold text-on-surface">Top Scored Opportunities</h3>
            <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
              View All Intelligence <span className="material-symbols-outlined notranslate text-sm" translate="no">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                  <th className="px-8 py-4">Lead Entity</th>
                  <th className="px-6 py-4">Intelligence Score</th>
                  <th className="px-6 py-4">Reasoning Tags</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {[
                  { name: "Nexus Ventures Ltd.", sector: "Fintech • London, UK", score: 92, tags: ["High Growth", "Verified"], color: "bg-primary-container/10 text-primary", abbr: "NV", status: "Active", statusColor: "text-emerald-600" },
                  { name: "Aether Systems", sector: "Aerospace • Berlin, DE", score: 88, tags: ["Repeat Buyer", "Strategic"], color: "bg-tertiary-container/10 text-tertiary", abbr: "AS", status: "Active", statusColor: "text-emerald-600" },
                  { name: "Iron Ore Logistics", sector: "Mining • Perth, AU", score: 85, tags: ["Verified", "Low Risk"], color: "bg-secondary-container/10 text-secondary", abbr: "IO", status: "In Review", statusColor: "text-on-surface-variant/60" },
                ].map((lead, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${lead.color}`}>{lead.abbr}</div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{lead.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-medium">{lead.sector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${lead.score}%` }}></div>
                        </div>
                        <span className="text-sm font-black text-on-surface">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        {lead.tags.map((tag, j) => (
                          <span key={j} className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${j === 0 ? lead.color : 'bg-surface-container-high text-on-surface-variant'}`}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${lead.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${lead.status === 'Active' ? 'bg-emerald-600' : 'bg-on-surface-variant/40'}`}></span> {lead.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="material-symbols-outlined notranslate text-on-surface-variant/40 hover:text-primary transition-colors" translate="no">more_horiz</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Execution HUD */}
      <div className="fixed bottom-8 left-[calc(50%+128px)] -translate-x-1/2 z-40">
        <div className="flex items-center gap-6 px-8 py-4 executive-glass border border-white/20 rounded-full shadow-2xl">
          <div className="flex items-center gap-3 border-r border-on-surface/10 pr-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-bold text-on-surface">3 Active Recalibrations</span>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2 rounded-full bg-white/50 text-on-surface text-xs font-bold hover:bg-white transition-colors">Abort Tasks</button>
            <button className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg hover:shadow-primary/30 transition-all">Review Deal Flux</button>
          </div>
        </div>
      </div>
    </div>
  );
}
