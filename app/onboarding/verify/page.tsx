'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';

export default function VerificationCompletePage() {
  const router = useRouter();
  const { updateUserProfile, user } = useAuth();
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await updateUserProfile({ 
        isOnboarded: true,
        onboardingStep: 6
      });
      router.push(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      setIsFinishing(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">Verification Complete</h1>
          <p className="text-on-surface-variant text-lg">Your sovereign profile has been validated against global institutional standards.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Circular Progress */}
          <div className="md:col-span-5 bg-white rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden border border-outline-variant/20">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-primary/20 text-6xl">verified_user</span>
            </div>
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-primary" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeDasharray="691" strokeDashoffset="0" strokeWidth="12"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black font-headline text-on-surface">100%</span>
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Validated</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                <span className="text-sm font-bold">KARM BABA Certified</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Pending Final Audit Review</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Credibility Score */}
            <div className="rounded-xl p-8 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}>
              <div>
                <span className="material-symbols-outlined text-white/80 text-4xl mb-4">analytics</span>
                <h3 className="text-white font-headline font-bold text-xl">Credibility Score</h3>
              </div>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-6xl font-black text-white">92</span>
                <span className="text-xl text-white/60">/100</span>
              </div>
              <p className="text-sm text-white/80 mt-2">Top 5% of assessed entities within your industry sector.</p>
            </div>

            {/* Risk Level */}
            <div className="rounded-xl p-8 flex flex-col justify-between bg-orange-50 border border-orange-100">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-4">shield_with_heart</span>
                <h3 className="text-on-surface font-headline font-bold text-xl">Risk Level</h3>
              </div>
              <div className="flex flex-col mt-4">
                <span className="text-5xl font-black text-green-600">Low</span>
                <div className="h-2 w-full bg-green-200 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-green-600 w-1/4"></div>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">Zero critical vulnerabilities detected in compliance history.</p>
            </div>

            {/* Verification Checklist */}
            <div className="sm:col-span-2 bg-orange-50/50 border border-orange-100 rounded-xl p-8">
              <h3 className="text-on-surface font-headline font-bold text-xl mb-6">Verification Checklist</h3>
              <div className="space-y-4">
                {['Identity', 'Compliance', 'Financials'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 bg-white rounded-lg border border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-bold text-on-surface">{item}</span>
                    </div>
                    <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="px-12 py-4 rounded-full font-headline font-bold text-lg text-white hover:scale-105 transition-transform duration-200 shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {isFinishing ? 'Finishing...' : 'Go to Dashboard'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
