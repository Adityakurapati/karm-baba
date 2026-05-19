'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';

export default function DynamicDiscoveryPage() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const [businessModel, setBusinessModel] = useState('dtc');
  const [isSaving, setIsSaving] = useState(false);
  const [exportMarket, setExportMarket] = useState('eu');
  const [capacity, setCapacity] = useState(4500);

  const markets = [
    { id: 'eu', icon: 'public', label: 'European Union' },
    { id: 'latam', icon: 'south_america', label: 'LATAM Region' },
    { id: 'apac', icon: 'language_pinyin', label: 'Asia-Pacific' },
  ];

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-32">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Step 3 of 5</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight font-headline">Dynamic Discovery</h1>
            <p className="text-on-surface-variant mt-2 text-lg">Operational parameters tailored to your regional infrastructure.</p>
          </div>
        </div>

        {/* Bento Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Smart Form */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <section className="bg-white rounded-xl p-8 md:p-10 border border-outline-variant/20">
              <div className="space-y-8">
                {/* Business Model */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Business Model</label>
                  <div className="relative">
                    <select
                      value={businessModel}
                      onChange={(e) => setBusinessModel(e.target.value)}
                      className="w-full bg-orange-50/30 border-none rounded-xl py-4 px-6 appearance-none focus:ring-2 focus:ring-primary/30 transition-all text-on-surface font-medium"
                    >
                      <option value="dtc">Direct-to-Consumer (DTC)</option>
                      <option value="b2b">B2B Distribution Network</option>
                      <option value="hybrid">Hybrid Manufacturing &amp; Retail</option>
                      <option value="licensing">Licensing &amp; Intellectual Property</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined notranslate text-on-surface-variant" translate="no">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Export Market */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Primary Export Market</label>
                  <div className="grid grid-cols-3 gap-4">
                    {markets.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setExportMarket(m.id)}
                        className={`flex flex-col items-center gap-2 p-6 rounded-xl transition-all ${
                          exportMarket === m.id
                            ? 'bg-orange-50 border-2 border-primary text-primary'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-orange-50/30'
                        }`}
                      >
                        <span className="material-symbols-outlined notranslate text-3xl" translate="no">{m.icon}</span>
                        <span className="text-xs font-bold uppercase">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capacity Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-widest">Annual Capacity (MT)</label>
                    {capacity === 0 && (
                      <span className="text-xs font-bold text-red-500 animate-pulse bg-red-50 px-2 py-0.5 rounded">Required &gt; 0</span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="flex-grow w-full">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="500"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <span>0 MT</span>
                        <span>100,000+ MT</span>
                      </div>
                    </div>
                    <div className="relative w-full sm:w-auto shrink-0">
                      <input 
                        type="number"
                        min="0"
                        max="10000000"
                        value={capacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCapacity(val < 0 ? 0 : val);
                        }}
                        className="w-full sm:w-36 bg-orange-50 border-2 border-primary/20 focus:border-primary focus:ring-0 rounded-lg pl-4 pr-10 py-3 font-bold text-primary text-center outline-none transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-primary/50 pointer-events-none">MT</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant italic">Reflects current output before optimization metrics.</p>
                </div>
              </div>
            </section>

            {/* Execution HUD */}
            <div className="bg-white/70 backdrop-blur-md rounded-full p-4 flex flex-col sm:flex-row justify-between items-center px-10 border border-outline-variant/20 shadow-lg gap-4">
              <span className="text-sm font-medium text-on-surface-variant italic">Data auto-saves in real-time</span>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/onboarding/industry')}
                  className="text-primary font-bold px-8 py-3 rounded-full hover:bg-primary/5 transition-all text-sm uppercase tracking-widest"
                >
                  Previous
                </button>
                <button
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      const success = await updateUserProfile({ onboardingStep: 4 });
                      if (success) {
                        router.push('/onboarding/documents');
                      } else {
                        alert('Failed to save progress. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error saving discovery progress:', error);
                      alert('An error occurred. Please try again.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || authLoading || !user || capacity === 0}
                  className="text-white font-bold px-10 py-3 rounded-full hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
                >
                  {isSaving ? 'Saving...' : authLoading ? 'Loading Profile...' : 'Analyze & Proceed'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* AI Next Best Action */}
              <div className="text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c44b1a, #e55a24)' }}>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="material-symbols-outlined notranslate text-orange-200" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <h3 className="text-xl font-bold tracking-tight font-headline">Next Best Action</h3>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                      Based on your <span className="text-orange-200 font-bold">European Union</span> selection, we recommend activating{' '}
                      <span className="underline underline-offset-4 decoration-orange-200">CBAM Reporting Protocol</span>.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="bg-orange-200 text-orange-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-1">1</span>
                      <p className="text-xs opacity-80 leading-snug">Toggle &apos;Automated Customs Filing&apos; to reduce lead times by 14%.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="bg-orange-200 text-orange-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-1">2</span>
                      <p className="text-xs opacity-80 leading-snug">Verify capacity metrics against current port congestion in Rotterdam.</p>
                    </div>
                  </div>
                  <button className="w-full bg-white text-primary font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-orange-50 transition-colors">
                    Apply Optimizations
                  </button>
                </div>
              </div>

              {/* Profile Precision */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-8">
                <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-6 font-headline">Profile Precision</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-grow h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[82%] rounded-full"></div>
                  </div>
                  <span className="text-lg font-black text-primary">82%</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium">Add &apos;Technical Specifications&apos; in Step 4 to reach 100% precision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
