'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { PlatformCategory } from '@/lib/types';

export default function IndustryTargetingPage() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [industries, setIndustries] = useState<PlatformCategory[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  useEffect(() => {
    const categoriesRef = ref(database, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const catsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PlatformCategory[];
        // Sort by creation or title
        catsArray.sort((a, b) => a.title.localeCompare(b.title));
        setIndustries(catsArray);
      } else {
        setIndustries([]);
      }
      setLoadingIndustries(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.company?.industry) {
      if (Array.isArray(user.company.industry)) {
        setSelected(user.company.industry);
      } else if (typeof user.company.industry === 'string' && user.company.industry !== '') {
        setSelected([user.company.industry]);
      }
    }
  }, [user]);

  const toggle = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0 || !user) return;
    
    setIsSaving(true);
    try {
      const success = await updateUserProfile({
        company: {
          ...(user.company || {}),
          industry: selected,
        },
        category: selected,
        onboardingStep: 3
      });
      
      if (success) {
        router.push('/onboarding/discovery');
      } else {
        alert('Failed to save your selection. Please try again.');
      }
    } catch (error) {
      console.error('Error saving industry:', error);
      alert('An error occurred while saving. Please check your connection.');
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
                disabled={selected.length === 0 || isSaving || authLoading || !user}
                className={`px-8 py-2 rounded-full text-white font-bold shadow-lg transition-all text-sm ${
                  selected.length > 0 && !isSaving && !authLoading && user ? 'hover:scale-[1.02] shadow-primary/20' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
              >
                {isSaving ? 'Saving...' : authLoading ? 'Loading Profile...' : 'Continue'}
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Industry Targeting</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">Select the primary commercial sectors where your influence and expertise are most concentrated. Our AI will calibrate your deal flow accordingly.</p>
        </div>

        {/* Industry Selection Grid */}
        <div className="flex flex-wrap gap-4">
          {loadingIndustries ? (
            <div className="w-full flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-on-surface-variant font-bold">Loading industries...</p>
            </div>
          ) : industries.length === 0 ? (
            <div className="w-full text-center py-12 text-on-surface-variant">
              No industries found. Please contact support.
            </div>
          ) : industries.map((ind) => {
            const isSelected = selected.includes(ind.title);

            return (
              <button
                key={ind.id}
                onClick={() => toggle(ind.title)}
                className={`px-6 py-4 rounded-xl text-sm font-bold font-headline transition-all duration-300 flex items-center gap-3 border shadow-sm ${
                  isSelected 
                    ? 'bg-primary text-white border-primary shadow-primary/20 scale-105' 
                    : 'bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/50 hover:text-primary hover:bg-orange-50/30'
                }`}
              >
                {isSelected && <span className="material-symbols-outlined notranslate text-[18px]" translate="no">check_circle</span>}
                {ind.title}
              </button>
            );
          })}
        </div>

        {/* Footer HUD */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border border-white/20 shadow-2xl z-50 min-w-[400px] max-w-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{selected.length}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sectors Selected</p>
              <p className="text-sm font-semibold">{selected.join(', ') || 'None'}</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={selected.length === 0 || isSaving || authLoading || !user}
            className={`px-10 py-3 rounded-full text-white font-bold shadow-xl transition-all ${
              selected.length > 0 && !isSaving && !authLoading && user ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {isSaving ? 'Saving...' : authLoading ? 'Loading Profile...' : 'Proceed to Discovery'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
