'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { useAuth } from '@/lib/auth-context';

export default function VerificationPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate dynamic trust score based on onboarding inputs
  let trustScore = 20; // Base score
  if (user.onboardingStep && user.onboardingStep > 2) trustScore += 15;
  if (user.company?.industry || user.category) trustScore += 15;
  if (user.isGstVerified) trustScore += 50;

  const isKarmBabaCertified = user.isKarmBabaCertified === true;

  return (
    <DashboardLayout title="Certification & Trust" searchPlaceholder="Search verification data...">


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
              <span className="text-2xl font-black text-primary">{user.credibilityScore || trustScore}/100</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.riskLevel === 'high' ? 'bg-red-500' : user.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`}></span>
              <span className={`text-sm font-bold ${user.riskLevel === 'high' ? 'text-red-700' : user.riskLevel === 'medium' ? 'text-orange-700' : 'text-emerald-700'} capitalize`}>Risk Level: {user.riskLevel || 'Unknown'}</span>
            </div>
          </div>
        </section>

        {/* Verification Progress */}
        <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-headline text-on-surface">{user.credibilityScore || trustScore}% Verification Complete</h2>
              <p className="text-on-surface-variant text-sm">You are {100 - (user.credibilityScore || trustScore)}% away from becoming a <span className="font-bold text-primary">Premium Verified Merchant</span>.</p>
            </div>
            <div className="flex-1 max-w-xl">
              <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${user.credibilityScore || trustScore}%`, background: 'linear-gradient(90deg, #e55a24, #ff9500)' }}></div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GST Verified Badge */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border ${user.isGstVerified ? 'border-emerald-200' : 'border-outline-variant'} flex flex-col items-center text-center`}>
            <div className="relative mb-6">
              <div className={`w-24 h-24 rounded-full p-1 ${user.isGstVerified ? 'bg-emerald-100' : 'bg-surface-container'}`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className={`material-symbols-outlined notranslate text-4xl ${user.isGstVerified ? 'text-emerald-500' : 'text-on-surface-variant/50'}`} translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {user.isGstVerified ? 'verified_user' : 'gpp_bad'}
                  </span>
                </div>
              </div>
              {user.isGstVerified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              )}
            </div>
            <h3 className={`text-xl font-black font-headline tracking-tight ${user.isGstVerified ? 'text-emerald-700' : 'text-on-surface'}`}>
              GST Registered Entity
            </h3>
            {user.isGstVerified ? (
              <>
                <p className="text-sm font-bold text-on-surface-variant mt-2 uppercase tracking-widest">{user.gstDetails?.legalName}</p>
                <div className="mt-6 w-full bg-emerald-50 rounded-xl p-4 text-left">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">GSTIN</p>
                  <p className="text-sm font-bold text-emerald-900">{user.gstDetails?.gstin}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant mt-2">GST Verification is pending or incomplete.</p>
            )}
          </div>

          {/* Karm Baba Certified Badge */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border ${isKarmBabaCertified ? 'border-primary/30 bg-orange-50/10' : 'border-outline-variant'} flex flex-col items-center text-center`}>
            <div className="relative mb-6">
              <div className={`w-24 h-24 rounded-full p-1 ${isKarmBabaCertified ? 'animate-pulse' : ''}`} style={isKarmBabaCertified ? { background: 'linear-gradient(135deg, #ff6b35, #ff9500, #e55a24)' } : { background: '#e2e8f0' }}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className={`material-symbols-outlined notranslate text-4xl ${isKarmBabaCertified ? 'text-primary' : 'text-on-surface-variant/50'}`} translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
              </div>
              {isKarmBabaCertified && (
                <div className="absolute -bottom-2 -right-2 bg-primary text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>
            <h3 className={`text-xl font-black font-headline tracking-tight ${isKarmBabaCertified ? 'text-primary' : 'text-on-surface'}`}>
              KARM BABA Certified
            </h3>
            {isKarmBabaCertified ? (
              <>
                <p className="text-xs font-medium text-on-surface-variant mt-2 uppercase tracking-widest">Active Partner</p>
                <div className="mt-6 w-full h-px bg-outline-variant/30"></div>
                <div className="mt-6 grid grid-cols-2 w-full gap-4">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-outline uppercase">Since</p>
                    <p className="text-sm font-bold text-on-surface">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-outline uppercase">Status</p>
                    <p className="text-sm font-bold text-on-surface">Authorized</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant mt-2">Pending in Verification</p>
            )}
          </div>
        </div>

      </main>
    </DashboardLayout>
  );
}
