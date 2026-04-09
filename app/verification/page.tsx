'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

export default function VerificationPage() {
  return (
    <DashboardLayout>
      <TopHeader title="Certification & Trust" searchPlaceholder="Search verification data..." />

      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Certification &amp; Trust</h1>
            <p className="text-on-surface-variant font-medium">Verify your institutional presence to unlock premium global deals.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trust Score</span>
              <span className="text-2xl font-black text-primary">92/100</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-700">Risk Level: Low</span>
            </div>
          </div>
        </section>

        {/* Verification Progress */}
        <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-headline text-on-surface">85% Verification Complete</h2>
              <p className="text-on-surface-variant text-sm">You are 15% away from becoming a <span className="font-bold text-primary">Premium Verified Merchant</span>.</p>
            </div>
            <div className="flex-1 max-w-xl">
              <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full rounded-full w-[85%]" style={{ background: 'linear-gradient(90deg, #e55a24, #ff9500)' }}></div>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-xs font-bold text-on-surface-variant">Standard</span>
                <span className="text-xs font-black text-primary">PREMIUM VERIFIED</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, #ff6b35, transparent)' }}></div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Trust Grid (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Grid: Mandatory & Financial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mandatory Base */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-headline">Mandatory Base</h3>
                  <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                </div>
                <div className="space-y-4">
                  {['GST Registration', 'PAN Verification', 'Signatory Identity'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="text-sm font-semibold">{item}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Credibility */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-headline">Financial Credibility</h3>
                  <span className="material-symbols-outlined text-secondary text-xl">account_balance</span>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Bank Statements', status: 'Processing' },
                    { name: 'Tax Filings (2Y)', status: 'In Review' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30 opacity-80">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500 animate-spin">sync</span>
                        <span className="text-sm font-semibold">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{item.status}</span>
                    </div>
                  ))}
                  <div className="p-3 border border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 group cursor-pointer hover:bg-orange-50/50 transition-colors">
                    <span className="material-symbols-outlined text-sm text-outline">add_circle</span>
                    <span className="text-xs font-bold text-outline uppercase tracking-wider">Add Credit History</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Compliance & Export Readiness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry Compliance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary border border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-headline">Industry Compliance (Pharma)</h3>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">medical_services</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/30 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-2">WHO-GMP</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-sm font-bold">Verified</span>
                    </div>
                  </div>
                  <div className="bg-orange-50/30 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-2">FDA License</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-base">pending</span>
                      <span className="text-sm font-bold">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Readiness */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-headline">Export Readiness</h3>
                  <span className="material-symbols-outlined text-primary text-xl">public</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: 'barcode', name: 'IEC Code Registration' },
                    { icon: 'local_shipping', name: 'Shipping Carrier Details' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold">{item.name}</p>
                          <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1 rounded-full mt-1">
                          <div className="w-full bg-primary h-full rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Trust Layer */}
            <div className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold font-headline mb-6">Advanced Trust Layer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-orange-300">videocam</span>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Video Verification</h4>
                    </div>
                    <p className="text-xs text-white/70 mb-4">Scheduled for Oct 24, 2023. This is the final step for &ldquo;Elite Trust&rdquo; badge.</p>
                    <button className="w-full py-2 bg-white text-on-surface font-bold text-xs rounded-full hover:scale-105 transition-transform">Join Session</button>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-orange-300">rule</span>
                      <h4 className="font-bold text-sm uppercase tracking-wider">3rd Party Audit</h4>
                    </div>
                    <p className="text-xs text-white/70 mb-4">Conducted by GlobalCert Bureau. All facilities have been pre-screened.</p>
                    <div className="flex items-center gap-2 text-orange-300">
                      <span className="material-symbols-outlined text-sm">event</span>
                      <span className="text-xs font-bold">Scheduled for tomorrow</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Sidebar Intelligence (Right 4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Certified Badge */}
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full p-1 animate-pulse" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9500, #e55a24)' }}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white w-8 h-8 rounded-full border-4 border-orange-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <h3 className="text-xl font-black font-headline tracking-tight text-primary">KARM BABA Certified</h3>
              <p className="text-xs font-medium text-on-surface-variant mt-2 uppercase tracking-widest">Active Partner</p>
              <div className="mt-6 w-full h-px bg-outline-variant/30"></div>
              <div className="mt-6 grid grid-cols-2 w-full gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-outline uppercase">Since</p>
                  <p className="text-sm font-bold text-on-surface">MAY 2021</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-outline uppercase">Next Review</p>
                  <p className="text-sm font-bold text-on-surface">MAY 2024</p>
                </div>
              </div>
            </div>

            {/* Growth Intelligence */}
            <div className="bg-orange-50/50 border border-orange-200/30 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-bold font-headline text-primary">Growth Intelligence</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/60 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-primary mb-1 uppercase">Recommendation 01</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Uploading your <span className="font-bold">ISO 9001</span> certificate will increase your trust score by <span className="text-emerald-600 font-bold">+6 points</span>.</p>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-primary mb-1 uppercase">Recommendation 02</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Link your <span className="font-bold">Corporate LinkedIn</span> to verify leadership continuity.</p>
                </div>
              </div>
            </div>

            {/* Action HUD */}
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-primary/5 space-y-3 border border-outline-variant">
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all">
                <span className="material-symbols-outlined">upload_file</span>
                Upload Missing Documents
              </button>
              <button className="w-full py-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all">
                <span className="material-symbols-outlined">report</span>
                Fix Flagged Issues
              </button>
              <button className="w-full py-4 bg-white border-2 border-primary/20 text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all">
                <span className="material-symbols-outlined">send</span>
                Request Final Review
              </button>
            </div>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
}
