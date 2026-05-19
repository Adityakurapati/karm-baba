import React from "react";

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Executive CRM Control</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Real-time portfolio intelligence and relationship velocity tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full font-headline text-sm font-bold bg-surface-container-highest text-primary hover:bg-surface-variant transition-all border border-primary/5">
            <span className="material-symbols-outlined notranslate text-lg" translate="no">ios_share</span>
            Export Data
          </button>
          <button className="flex items-center gap-2 px-8 py-2.5 rounded-full font-headline text-sm font-bold text-white chart-gradient-blue shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <span className="material-symbols-outlined notranslate text-lg" translate="no">tune</span>
            System Settings
          </button>
        </div>
      </div>

      {/* Top Row: Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Conversion Funnel */}
        <div className="xl:col-span-3 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold font-headline">Conversion Funnel</h3>
            <span className="text-xs font-bold text-primary px-3 py-1 bg-primary-container/10 rounded-full uppercase tracking-tighter">Q3 Growth: +18%</span>
          </div>
          <div className="space-y-8">
            {[
              { label: "New Opportunities", value: "$4.2M", width: "100%", opacity: "1" },
              { label: "Qualified Leads", value: "$2.8M", width: "65%", opacity: "0.8" },
              { label: "Negotiation Phase", value: "$1.5M", width: "40%", opacity: "0.6" },
              { label: "Won Deals", value: "$920K", width: "22%", opacity: "0.4" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="w-full h-8 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full chart-gradient-blue transition-all duration-1000" 
                    style={{ width: item.width, opacity: item.opacity }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Velocity */}
        <div className="xl:col-span-2 bg-primary text-white p-8 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="relative z-10">
            <h3 className="text-xl font-bold font-headline">Revenue Velocity</h3>
            <p className="text-on-primary-container text-sm font-medium mt-1">Monthly recurring trajectory</p>
          </div>
          <div className="relative z-10 mt-12">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold tracking-tighter">$842.5K</span>
              <span className="text-primary-container text-lg font-bold bg-white/20 px-2 py-0.5 rounded">+12.4%</span>
            </div>
            <div className="mt-8 h-32 flex items-end gap-1.5">
              {[40, 55, 48, 70, 65, 85, 100].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 hover:opacity-100 ${i === 6 ? 'bg-white' : i === 5 ? 'bg-white/40' : 'bg-white/20'}`} 
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>
          {/* Decorative mesh gradient background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at top right, var(--tertiary), transparent)" }}></div>
        </div>
      </div>

      {/* RM Performance Metrics */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-headline text-on-surface">RM Performance Metrics</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View All RMs <span className="material-symbols-outlined notranslate text-sm" translate="no">chevron_right</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Jane Dawson", role: "Senior Partner", pipeline: "$2.4M", conv: "32%", score: 98, trend: "trending_up", color: "text-primary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZOYM34e3iSquq8rIMuW_MQyan2H9T6BVq3Mdk8UIrs-EqwfK9s7lRp0b8A-07Jbt_6KUU41KdA5prSneIHRWfB45vBLEfxNF6Hpc9B8O9jtYeLphMC45upW5i6LqAxgUFn3RSEoGHZg8tzOrLUQCcyDmUbuHX3R6PfsAnH3Cxiu3keSlGJsV606xMyXFOoiX_ACCzSeBK0niApmB5RS_5hmTHJxYvQ7ojuv0FZ9ivLgnoOF7JchVzFsXuxiFV4Vf4gNRVcfkxSq4" },
            { name: "Marcus Reed", role: "Portfolio Lead", pipeline: "$1.8M", conv: "28%", score: 85, trend: "trending_flat", color: "text-secondary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA47iaxfZTgomuAov-pVtPX9ig3q11VtMxIzEF1eCPd1_Cp_QG2piMyN0TkwlmvvClPA_C2abjv_PNGiqXZZYk0eAhRJIc9vl9irSEuVKXkWAelwOs5_gz12R-EvKL4LOGPCVCwRjT2FA6YcNPMH8Bmxm8tc3H91-uotCS5fibdJMLVMZJ_JzadKvee0UTaXQx0jEnZxw33vmJjfgXs51d208qKAVQ__igM0FSDGMyARGVI_PO6ErHTt9SCBWfej4mcRvV_ar03QqQ" },
            { name: "Sarah Lin", role: "Key Accounts", pipeline: "$3.1M", conv: "41%", score: 94, trend: "trending_up", color: "text-primary", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFGBabwlxX8SEzA3o_4MPmkGvvv3XjP2qsT--m-6ARgNx_4mCo7Z7eDvZ4fKnPI6RgXh0U_PYKPbQRZnayt9A_tGcHJFzXERNm4902D4C4449D3tCQGMyY2jmQ5BQEmvnWnwXmyBYjWCIYuVYKkM3GLrm-f1sZQ8xGSW3PjR82ubA-edSB_0xei2cY0T1ov6WW5gHIkBVVQypwzMtMEVwkj3q4b3lYLKYNe4fZ4T0rjEMOItg1BvKP0aJOJBlNflEz7m76pndpqxs" },
            { name: "Brian Kim", role: "Associate Director", pipeline: "$1.2M", conv: "24%", score: 62, trend: "trending_down", color: "text-error", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV1_3Ld9J4iRkVyHzT_8fC92CTBxoS2nhQ89RtXKoKCxR6Qp_jgUfmTR_Y0tiaSbQCCqS-vRQ7hS7uQ4HIbBAowASgEGrnb6DNC7Sqzn84pU8IW-7FBk1vGDhA1SJ1BaI8_mmlADIyh4XBy5IlRxJPBW5LpUwSLgoL7BRa1k925huM43mKFJDHdOVj78nuuBWmes6MTcAlZI5I7dwkl4SGmWQiUfgK1pBOWVU1IOgAoqGbIXWe-ZUFHLX9yYtdWtUxHUrb5oJZmm8" },
          ].map((rm, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:bg-surface-container-highest transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img alt={rm.name} src={rm.img} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{rm.name}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{rm.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Pipeline</p>
                  <p className="text-lg font-extrabold text-on-surface">{rm.pipeline}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Conv. Rate</p>
                  <p className="text-lg font-extrabold text-on-surface">{rm.conv}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${rm.score > 80 ? 'bg-tertiary-container/10 text-tertiary' : 'bg-error-container text-on-error-container'}`}>
                  Lead Score: {rm.score}
                </span>
                <span className={`material-symbols-outlined notranslate ${rm.color} group-hover:translate-x-1 transition-transform`} translate="no">
                  {rm.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Section: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
        {/* Top Strategic Clients */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="text-lg font-bold font-headline">Top Strategic Clients</h3>
            <span className="material-symbols-outlined notranslate text-on-surface-variant cursor-pointer" translate="no">more_horiz</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Company Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Portfolio Value</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Growth %</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {[
                  { name: "Nexus Globals", val: "$840,200", growth: "+14.2%", health: 92 },
                  { name: "Aether Dynamics", val: "$625,000", growth: "+8.4%", health: 85 },
                  { name: "Vanguard Systems", val: "$510,000", growth: "+21.0%", health: 96 },
                  { name: "Horizon FinTech", val: "$490,500", growth: "+4.5%", health: 78 },
                ].map((client, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5 font-bold text-on-surface">{client.name}</td>
                    <td className="px-6 py-5 font-medium">{client.val}</td>
                    <td className="px-6 py-5 text-primary font-bold">{client.growth}</td>
                    <td className="px-6 py-5">
                      <div className="w-full bg-surface-container h-1.5 rounded-full">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${client.health}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High-Risk Accounts */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="text-lg font-bold font-headline text-error">High-Risk Accounts</h3>
            <span className="material-symbols-outlined notranslate text-error cursor-pointer" translate="no">warning</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Company Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Risk Level</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {[
                  { name: "Solstice Retail", level: "Critical", reason: "Payment Default", active: "2 hours ago", bg: "bg-error text-white" },
                  { name: "BlueWave Logistics", level: "Elevated", reason: "Low Engagement", active: "3 days ago", bg: "bg-error-container text-on-error-container" },
                  { name: "Zenith Properties", level: "Elevated", reason: "Legal Conflict", active: "1 week ago", bg: "bg-error-container text-on-error-container" },
                  { name: "Iron Gate Sec", level: "Critical", reason: "Executive Churn", active: "14 mins ago", bg: "bg-error text-white" },
                ].map((risk, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5 font-bold text-on-surface">{risk.name}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${risk.bg}`}>{risk.level}</span>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-on-surface-variant">{risk.reason}</td>
                    <td className="px-6 py-5 text-xs text-on-surface-variant">{risk.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Execution HUD: Floating Glass Action Bar */}
      <div className="fixed bottom-6 left-[calc(50%+128px)] -translate-x-1/2 px-8 py-3 executive-glass border border-primary/20 rounded-full flex items-center gap-8 shadow-2xl z-50">
        <div className="flex items-center gap-2 pr-6 border-r border-primary/10">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Engine</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-xs font-bold text-on-surface hover:text-primary transition-colors group">
            <span className="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform" translate="no">add_circle</span>
            New Engagement
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-on-surface hover:text-primary transition-colors group">
            <span className="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform" translate="no">flag</span>
            Priority Actions
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-on-surface hover:text-primary transition-colors group">
            <span className="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform" translate="no">smart_toy</span>
            AI Insights
          </button>
        </div>
      </div>
    </div>
  );
}
