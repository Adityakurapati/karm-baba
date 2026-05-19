import React from "react";

export default function PerformanceBriefing() {
  return (
    <div className="pt-8 pb-12 px-10 space-y-10 max-w-[1600px] mx-auto animate-fade-in">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant tracking-widest mb-2">
            <span className="uppercase">Intelligence</span>
            <span className="material-symbols-outlined notranslate text-[10px]" translate="no">chevron_right</span>
            <span className="text-primary uppercase">RM Performance</span>
          </nav>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">RM Performance Briefing</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl font-medium">Real-time performance analytics across executive tiers. Monitoring high-velocity deal flow and conversion efficiency.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-surface-container-lowest text-on-surface font-semibold text-sm rounded-xl shadow-sm border border-outline-variant/15 flex items-center gap-2 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined notranslate text-lg" translate="no">calendar_today</span>
            Last 30 Days
          </button>
          <button className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined notranslate text-lg" translate="no">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Hero Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Deals", value: "1,284", change: "+12%", color: "text-emerald-600", bg: "bg-emerald-50", progress: 75, icon: "trending_up" },
          { label: "Conversion Rate", value: "24.8%", change: "+3.2%", color: "text-emerald-600", bg: "bg-emerald-50", progress: 60, icon: "trending_up" },
          { label: "Avg. Cycle Time", value: "42 days", change: "-4d", color: "text-secondary", bg: "bg-secondary-container/10", progress: null, icon: "schedule", target: "38 Days" },
          { label: "Total Asset Value", value: "$8.42B", change: null, color: "text-white", bg: "bg-gradient-to-br from-primary to-primary-container", progress: null, icon: "account_balance", special: true },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-all group ${stat.special ? stat.bg : 'bg-surface-container-lowest'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${stat.special ? 'text-white/80' : 'text-on-surface-variant'}`}>{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-headline font-extrabold ${stat.special ? 'text-white' : 'text-on-surface'}`}>{stat.value}</h3>
              {stat.change && (
                <span className={`${stat.color} font-bold text-xs flex items-center ${stat.bg} px-2 py-1 rounded-full`}>
                  <span className="material-symbols-outlined notranslate text-sm mr-1" translate="no">{stat.icon}</span> {stat.change}
                </span>
              )}
              {stat.special && <span className="material-symbols-outlined notranslate text-3xl opacity-30 text-white" translate="no">{stat.icon}</span>}
            </div>
            {stat.progress !== null && (
              <div className="mt-4 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${stat.progress}%` }}></div>
              </div>
            )}
            {stat.target && (
              <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">
                <span>Target: {stat.target}</span>
                <span className="text-primary font-bold">On Track</span>
              </div>
            )}
            {stat.label === "Total Asset Value" && <p className="mt-4 text-[10px] uppercase font-bold tracking-widest opacity-60 text-white">AUM Management Peak</p>}
          </div>
        ))}
      </section>

      {/* Main Performance Chart & Rankings */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regional Performance Visualization */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="font-headline font-bold text-xl text-on-surface">Performance by Region</h4>
              <p className="text-sm text-on-surface-variant">Global deal volume distribution across key territories.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-high rounded text-xs font-bold text-primary">MAP</span>
              <span className="px-3 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs font-bold text-on-surface-variant">LIST</span>
            </div>
          </div>
          <div className="relative h-[360px] w-full rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-center bg-no-repeat bg-contain"></div>
            <div className="grid grid-cols-3 gap-8 w-full px-12 z-10">
              {[
                { name: "AMER", val: "$3.2B", color: "bg-primary", width: "85%" },
                { name: "EMEA", val: "$2.8B", color: "bg-secondary", width: "62%" },
                { name: "APAC", val: "$2.42B", color: "bg-tertiary", width: "45%" },
              ].map((reg, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${reg.color}`}></div>
                    <span className="font-bold text-on-surface">{reg.name}</span>
                  </div>
                  <p className="text-3xl font-headline font-bold text-on-surface">{reg.val}</p>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${reg.color} transition-all duration-1000`} style={{ width: reg.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Penetration */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/5">
          <h4 className="font-headline font-bold text-xl text-on-surface mb-2">Industry Penetration</h4>
          <p className="text-sm text-on-surface-variant mb-8">Focus sectors by capitalization.</p>
          <div className="space-y-6">
            {[
              { label: "SaaS & Cloud", count: "342 Entities", pct: "42%", icon: "cloud", color: "bg-blue-50 text-primary" },
              { label: "Energy Infrastructure", count: "128 Entities", pct: "28%", icon: "bolt", color: "bg-purple-50 text-tertiary" },
              { label: "Health-Tech", count: "89 Entities", pct: "18%", icon: "health_metrics", color: "bg-emerald-50 text-emerald-700" },
              { label: "Others", count: "56 Entities", pct: "12%", icon: "more_horiz", color: "bg-slate-100 text-on-surface-variant" },
            ].map((sector, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sector.color}`}>
                    <span className="material-symbols-outlined notranslate" translate="no">{sector.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{sector.label}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">{sector.count}</p>
                  </div>
                </div>
                <span className="font-headline font-bold">{sector.pct}</span>
              </div>
            ))}
          </div>
          <button className="mt-10 w-full py-3 border border-outline-variant rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            View Sector Breakdown
          </button>
        </div>
      </section>

      {/* Strategic Talent Pool */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-headline font-bold text-2xl text-on-surface">Strategic Talent Pool</h4>
            <p className="text-on-surface-variant">Performance ranking of Tier-1 Relationship Managers</p>
          </div>
          <div className="flex gap-4">
            <select className="bg-surface-container-low border-none rounded-lg text-sm font-bold text-on-surface-variant focus:ring-primary outline-none py-2 px-4">
              <option>Highest AUM</option>
              <option>Conversion Velocity</option>
              <option>Client Retention</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {[
            { name: "Elena Moretti", role: "Senior Director, EMEA", pipeline: "$840M", rank: 1, csat: "9.8", color: "border-primary", badge: "bg-primary-container text-white", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRetX5PLtnuteW40GEOlQ12XUA7w6OMIy1favL_ldwvYvV5Q_pganUQpmFhALCpDiAbocjR5FWWRdMNL55BN5pvJEPuHjhvaEgNJlhbphNKMSrSfAuT4vQqIZ4N-Rn2LmHP8ntzhb0bWOPoKhK2MoZSsdbMvyLwp_SiUySyAOQojMJcdMZAJXniAnww2hg0Xo38KdNK1iiB5iH-X9-nWXlEAZT9tF6ePPpLJPyG2i8CImak-S8Ez8yX4oGSSjPnTDluo_a5bz3KqU" },
            { name: "Marcus Sterling", role: "VP, Americas", pipeline: "$725M", rank: 2, csat: "9.4", color: "border-secondary", badge: "bg-secondary-container text-white", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyHT_lmUH1C2vsK-sG-lM70jqA3VJpphtdxe_6jkVMsotbwHTR6Cv9rmPWrgCeQqF3U34i-Z0vghKk22M9217IabsmsEURbPOYV-ISwuyXpyyG6oEZObrUhVweQJNSdzi8x7X9ZNLYDTZA42ambtYuNxL55nQT9zsv4k4EsytoWAUelwLy6o35RtGCtEsUNj-ZjCtmWs2f8OUOR0_fq_chyIFbQY_SSKJy9sd2fotpXiWpHqC6vBczYn_Tqt2XOPXsSNx8dBWN_E0" },
            { name: "Sarah Jenkins", role: "Associate, APAC", pipeline: "$410M", rank: null, growth: "+18% Growth", color: "border-tertiary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ8HUVpRX-xSRww4cVTA3-zslWpvPyT1kFq7UKrMjljZ84jPxotPXDAukElbNnGcPzB3EEpf1REw78EQ4rKoD9Ced3bQNYGV8nYJe9Q22H_Kxhc4_SHNZ9PDPviCQm6of0l1yVuzPNQhacLRAuePCBdsarPvRBOS1_Yq-DScyJX_uya7Uosw2Ro5qdnpV_GXhBMwSIebmKhN-0QEbzkcCCTt5M7rte4pTrWpQhd1zCieuutk5J6qpY8-4f1BneTk9q_Ht1H1OpTO0", star: true },
            { name: "David Chen", role: "Principal, Americas", pipeline: "$385M", rank: null, growth: "+14% Growth", color: "border-tertiary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL1Px8nrTEGXBbDbnCDggGl40Je_mxKYX9vwB8gs0e2gd8Eg6kC1PQl9w4FTH5rRGgIZcy70Jc-E5w_IpriBWuw_ECdUZO8G4uZ3D7imlCyWVzvRUuhio95-vA7mUgf6gBHvXXv7HJ_CqPMDf_sWoMIh7Ph6e5mGSzwlMIsUXJJWCYiqH1A9pUsi_RlPOmY1W-IramUYKToDsiG-l8gfUF6zmGs9F2pwJKb28eUYQE04w1SHeHYWk9rDzc3dpEdo2iog6hL599-H0", star: true },
          ].map((rm, i) => (
            <div key={i} className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 ${rm.color} relative overflow-hidden group`}>
              {rm.star && (
                <div className="absolute top-0 right-0 p-2">
                  <span className="text-[8px] bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Rising Star</span>
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <img alt={rm.name} src={rm.img} className={`h-14 w-14 rounded-full object-cover ${rm.star ? 'grayscale group-hover:grayscale-0 transition-all' : ''}`} />
                  {rm.rank && (
                    <div className={`absolute -bottom-1 -right-1 h-6 w-6 ${rm.badge} rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white`}>{rm.rank}</div>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${rm.growth ? 'text-emerald-600' : 'text-on-surface-variant'}`}>
                    {rm.growth || 'Active Pipeline'}
                  </p>
                  <p className="text-xl font-headline font-bold text-on-surface">{rm.pipeline}</p>
                </div>
              </div>
              <h5 className="font-bold text-lg leading-tight">{rm.name}</h5>
              <p className="text-xs text-on-surface-variant mb-4">{rm.role}</p>
              {rm.csat ? (
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined notranslate text-sm text-yellow-500" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold text-on-surface-variant">{rm.csat} CSAT</span>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-on-surface-variant">
                    <span>{rm.name === 'Sarah Jenkins' ? 'Cycle Velocity' : 'Deal Frequency'}</span>
                    <span>{rm.name === 'Sarah Jenkins' ? 'Top 5%' : 'Top 8%'}</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: rm.name === 'Sarah Jenkins' ? '95%' : '88%' }}></div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary border-t border-slate-100 pt-4 cursor-pointer hover:opacity-70 transition-opacity mt-2">
                View Deal Sheet
                <span className="material-symbols-outlined notranslate text-sm" translate="no">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Execution HUD (Floating Footer) */}
      <div className="fixed bottom-8 left-[calc(50%+128px)] -translate-x-1/2 executive-glass px-8 py-4 rounded-full border border-outline-variant/10 shadow-2xl z-50 flex items-center gap-12">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined notranslate text-secondary" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-on-surface-variant">Executive Intelligence</p>
            <p className="text-[10px] font-medium text-on-surface">3 RM targets nearing performance threshold. <span className="text-primary font-bold cursor-pointer hover:underline">Notify VP?</span></p>
          </div>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/30"></div>
        <div className="flex gap-4">
          <button className="text-[10px] font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors">Export Briefing</button>
          <button className="bg-primary px-6 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20">Run Simulation</button>
        </div>
      </div>
    </div>
  );
}
