'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';

const industries = [
  { id: 'agriculture', icon: 'agriculture', title: 'Agriculture', match: 3, tags: ['AgriTech', 'Logistics'], span: 1 },
  { id: 'pharma', icon: 'medical_services', title: 'Pharma & Life Sciences', match: 4, tags: ['Drug Discovery', 'Supply Chain', 'Clinical Trials'], span: 1 },
  { id: 'automotive', icon: 'directions_car', title: 'Automotive', match: 2, tags: ['EV Systems', 'Autonomy'], span: 1 },
  { id: 'textiles', icon: 'apparel', title: 'Textiles & Apparel', match: 3, tags: ['Sustainable Fibers', 'Smart Fabrics', 'Industrial Weaving'], desc: 'Focus on sustainable sourcing and vertical manufacturing systems.', marketFit: 82, span: 2 },
  { id: 'machinery', icon: 'precision_manufacturing', title: 'Machinery', match: 3, tags: ['Heavy Tech'], span: 1 },
];

export default function IndustryTargetingPage() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>(['pharma']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.company?.industry) {
      if (Array.isArray(user.company.industry)) {
        setSelected(user.company.industry);
      } else if (typeof user.company.industry === 'string' && user.company.industry !== '') {
        setSelected([user.company.industry]);
      }
    }
  }, [user]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile({
        company: {
          ...user!.company,
          industry: selected,
        }
      });
      router.push('/onboarding/discovery');
    } catch (error) {
      console.error('Error saving industry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-40">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase">Step 2 of 5</div>
              <div className="h-1 w-48 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/5"></div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant font-semibold hover:bg-surface-container-low transition-colors text-sm">Save Draft</button>
              <button
                onClick={handleContinue}
                disabled={selected.length === 0 || isSaving}
                className={`px-8 py-2 rounded-full text-white font-bold shadow-lg transition-all text-sm ${
                  selected.length > 0 && !isSaving ? 'hover:scale-[1.02] shadow-primary/20' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
              >
                {isSaving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Industry Targeting</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">Select the primary commercial sectors where your influence and expertise are most concentrated. Our AI will calibrate your deal flow accordingly.</p>
        </div>

        {/* Industry Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {industries.map((ind) => {
            const isSelected = selected.includes(ind.id);
            const isWide = ind.span === 2;

            if (isWide) {
              return (
                <div
                  key={ind.id}
                  onClick={() => toggle(ind.id)}
                  className={`col-span-1 md:col-span-2 bg-white p-8 rounded-xl transition-all duration-300 hover:bg-orange-50/30 group relative cursor-pointer overflow-hidden ${
                    isSelected ? 'border-2 border-primary' : 'border border-transparent hover:border-primary/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-4xl">{ind.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 font-headline">{ind.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-4">{ind.desc}</p>
                      <div className="flex flex-wrap gap-3">
                        {ind.tags.map((tag) => (
                          <span key={tag} className="px-4 py-1.5 bg-orange-50 rounded-full text-xs font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check</span> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {ind.marketFit && (
                      <div className="bg-orange-50 p-4 rounded-xl text-center min-w-[120px]">
                        <div className="text-2xl font-black text-primary">{ind.marketFit}%</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Market Fit</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ind.id}
                onClick={() => toggle(ind.id)}
                className={`bg-white p-8 rounded-xl transition-all duration-300 hover:bg-orange-50/30 group relative cursor-pointer overflow-hidden ${
                  isSelected ? 'border-2 border-primary' : 'border border-transparent hover:border-primary/20'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">{ind.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-headline">{ind.title}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Match Potential</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i <= ind.match ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ind.tags.map((tag) => (
                      <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${isSelected ? 'bg-primary text-white' : 'bg-orange-50 text-primary'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer HUD */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border border-white/20 shadow-2xl z-50 min-w-[400px] max-w-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{selected.length}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sectors Selected</p>
              <p className="text-sm font-semibold">{selected.map(s => industries.find(i => i.id === s)?.title).filter(Boolean).join(', ') || 'None'}</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={selected.length === 0 || isSaving}
            className={`px-10 py-3 rounded-full text-white font-bold shadow-xl transition-all ${
              selected.length > 0 && !isSaving ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {isSaving ? 'Saving...' : 'Proceed to Discovery'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
