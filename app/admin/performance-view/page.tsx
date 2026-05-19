import React from "react";

export default function PerformanceView() {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant tracking-widest mb-2">
            <span className="uppercase">Intelligence</span>
            <span className="material-symbols-outlined notranslate text-[10px]" translate="no">chevron_right</span>
            <span className="text-primary uppercase">RM PERFORMANCE</span>
          </nav>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Relationship Management</h2>
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

      {/* Executive KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Deals", value: "142", change: "+12.4%", icon: "payments", color: "text-primary", bg: "bg-primary/10", progress: 72, trendColor: "text-green-600" },
          { label: "Conversion Rate", value: "28.4%", change: "+2.1%", icon: "analytics", color: "text-secondary", bg: "bg-secondary/10", progress: 45, trendColor: "text-green-600" },
          { label: "Avg. Cycle Time", value: "42 Days", change: "-4 days", icon: "schedule", color: "text-tertiary", bg: "bg-tertiary/10", progress: 60, trendColor: "text-error" },
          { label: "Total Asset Value", value: "$1.24B", change: "+18.2%", icon: "account_balance", color: "text-primary-container", bg: "bg-primary-container/10", progress: 88, trendColor: "text-green-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined notranslate" translate="no">{kpi.icon}</span>
              </div>
              <span className={`text-xs font-bold ${kpi.trendColor} ${kpi.trendColor === 'text-green-600' ? 'bg-green-50' : 'bg-error-container/20'} px-2 py-1 rounded`}>{kpi.change}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">{kpi.label}</p>
            <h3 className="text-3xl font-headline font-extrabold text-on-surface mt-1">{kpi.value}</h3>
            <div className="mt-4 w-full bg-surface-container h-1 rounded-full overflow-hidden">
              <div className={`${kpi.color.replace('text-', 'bg-')} h-full transition-all duration-1000`} style={{ width: `${kpi.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Ranking & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Bar Chart Container */}
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-headline font-bold text-xl">Top RM Performance Ranking</h4>
              <p className="text-sm text-on-surface-variant">Revenue generation by top-tier Relationship Managers</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-highest text-primary shadow-sm"><span className="material-symbols-outlined notranslate text-lg" translate="no">bar_chart</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"><span className="material-symbols-outlined notranslate text-lg" translate="no">show_chart</span></button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { name: "ALEXA VANCE", val: "$420M", pct: "92%" },
              { name: "JORDAN SMITH", val: "$385M", pct: "84%" },
              { name: "SARAH CHEN", val: "$342M", pct: "76%" },
              { name: "MICHAEL ROSS", val: "$290M", pct: "62%" },
              { name: "ELENA GOMEZ", val: "$265M", pct: "58%" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <span className="w-32 text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">{row.name}</span>
                <div className="flex-1 h-8 bg-surface-container rounded-r-lg overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container rounded-r-lg transition-all duration-1000" 
                    style={{ width: row.pct }}
                  ></div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">{row.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RM Individual Cards Column */}
        <div className="space-y-6">
          <h4 className="font-headline font-bold text-lg flex items-center justify-between">
            Rising Stars
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
          </h4>
          {[
            { name: "Sarah Chen", role: "FinTech Specialist", deals: 24, velocity: "+18%", tag: "TOP CONVERTER", tagBg: "bg-green-100 text-green-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuClKMPkLG_B5Rg5xbc17IP7Bk-T0Jc3i31DW3_LtxXnoOac_tuVvIwTvqir1LEnGJx2xQ03TS2o-PyUWr-Uvgu9CMbYAkik0cQpcavLfvzgtFyLhSm4pVU-b7ixMWYhBOV_4TNn9Acp4uBtcCObcDGU4U3TA2V624CfwV2TSVI-kt8kruChbqRxX9F4DEXOYJNPuVa6cBQv-auwgR0ca71pRt4whYVcodYv72Hw3ayor62p3RpQRXFlX8a83JSfPR66wUGfRaQRoLw" },
            { name: "Michael Ross", role: "Real Estate Expert", deals: 31, velocity: "+8%", tag: "VOLUME MASTER", tagBg: "bg-blue-100 text-blue-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd82hb4KM4BTaSmRelw-3JCGLwAnBA7HVc6Jsyq57c07On7hTIcio_64L4jWEMAcu1FuFsVpEA-cYIRv7y_UBhnJL0HgNgwOUEkqoMJifP_SARwQ64EnHSPmrCByrm6HBy-Z0pd7aZNsBryfI-PVgklJPZDrGvIR69iL2RlXhZJoglCeTuoBoVjwGE-63G7AleygG63c9u-uQy8Bm3kOo8QTnG2Td3HlVA2H2MEVxIVOJHVCHzeSKmMCtMAfwMRd5XpPRj_l5rWrQ" },
          ].map((rm, i) => (
            <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm hover:translate-x-1 hover:shadow-md transition-all cursor-pointer">
              <div className="flex gap-4 items-start">
                <img alt={rm.name} src={rm.img} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-sm">{rm.name}</h5>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${rm.tagBg}`}>{rm.tag}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium">{rm.role}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-outline-variant/10 pt-3">
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">Deals</p>
                      <p className="text-sm font-bold text-primary">{rm.deals}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">Velocity</p>
                      <p className="text-sm font-bold text-primary">{rm.velocity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional & Industry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
        {/* Regional Performance Card */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined notranslate text-8xl text-primary" translate="no">public</span>
          </div>
          <h4 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Performance by Region
          </h4>
          <div className="space-y-5">
            {[
              { reg: "APAC", pct: "85%", val: "$542M" },
              { reg: "EMEA", pct: "62%", val: "$389M" },
              { reg: "AMER", pct: "78%", val: "$491M" },
            ].map((reg, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-on-surface-variant w-12 tracking-tight">{reg.reg}</span>
                  <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: reg.pct }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-on-surface">{reg.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Distribution Card */}
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
          <h4 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-tertiary rounded-full"></span>
            Industry Penetration
          </h4>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "FinTech", val: "34.2%" },
              { label: "SaaS", val: "22.8%" },
              { label: "Energy", val: "18.5%" },
              { label: "Health", val: "14.1%" },
            ].map((ind, i) => (
              <div key={i} className="bg-surface-container-highest px-4 py-3 rounded-2xl flex-1 min-w-[140px] shadow-sm hover:translate-y-[-2px] transition-transform">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">{ind.label}</p>
                <p className="text-xl font-headline font-extrabold text-on-surface">{ind.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Execution HUD */}
      <footer className="fixed bottom-8 left-[calc(50%+128px)] -translate-x-1/2 w-full max-w-2xl z-[60] px-4">
        <div className="executive-blur bg-surface-container-highest/70 border border-outline-variant/20 rounded-full p-2 flex items-center justify-between shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined notranslate text-sm" translate="no">rocket_launch</span>
            </div>
            <p className="text-xs font-bold text-on-surface">Q3 Strategy Implementation Active</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/80 text-on-surface font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full border border-outline-variant/10 hover:bg-white transition-colors">
              Adjust Thresholds
            </button>
            <button className="bg-primary text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full shadow-lg shadow-primary/20 hover:scale-102 transition-transform">
              Launch Campaign
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
