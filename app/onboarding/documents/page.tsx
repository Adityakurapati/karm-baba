'use client';

import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { useState, useRef } from 'react';
import { verifyGST, GSTVerificationResult, extractPANFromDocument, verifyPanAadhaarStatus } from '@/lib/sandbox';
import { GST_STATE_CODES, STATE_NAMES } from '@/lib/gst-codes';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '@/lib/firebase';

function fuzzyMatch(input: string, target: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nInput = normalize(input);
  const nTarget = normalize(target);
  if (!nInput || !nTarget) return false;
  return nTarget.includes(nInput) || nInput.includes(nTarget);
}


const documentSlots = [
  {
    id: 'gst',
    icon: 'description',
    title: 'GST Registration',
    desc: 'Official certificate issued by the tax authority. Your PAN will be derived automatically from this.',
    badge: 'MANDATORY',
    badgeColor: 'bg-red-100 text-red-700',
    span: 2,
  },
];

export default function DocumentUploadPage() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // GST State
  const [gstin, setGstin] = useState('');

  const [selectedState, setSelectedState] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Aadhaar State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isAadhaarVerifying, setIsAadhaarVerifying] = useState(false);
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);

  const isGstVerified = user?.isGstVerified || user?.verificationBadges?.some(b => b.type === 'gst');
  const isAadhaarVerified = user?.verificationBadges?.some(b => b.type === 'pan');

  const handleVerifyGST = async () => {
    if (!gstin || !selectedState) {
      setVerificationError('Please enter GST Number and select a state.');
      return;
    }

    const stateCode = GST_STATE_CODES[selectedState];
    if (!stateCode) {
      setVerificationError('Invalid state selected.');
      return;
    }

    // 1st Check: GST Number belongs to correct state
    if (gstin.substring(0, 2) !== stateCode) {
      setVerificationError(`GST Number does not belong to the selected state. Expected code ${stateCode} for ${selectedState}.`);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    try {
      // 2nd Check: GST Number is not already used by another user
      const usersRef = ref(database, 'users');
      const gstQuery = query(usersRef, orderByChild('gstDetails/gstin'), equalTo(gstin.toUpperCase()));
      const snapshot = await get(gstQuery);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const otherUserId = Object.keys(users).find(id => id !== user?.id);
        if (otherUserId) {
          setVerificationError('This GST Number is already registered with another account.');
          setIsVerifying(false);
          return;
        }
      }

      const result = await verifyGST(gstin);
      if (result.success && result.data) {
        const d = result.data;

        // 1. Check Status
        if (d.status.toLowerCase().includes('cancelled')) {
          setVerificationError(`GSTIN is Cancelled. Reason: ${d.status}`);
          setIsVerifying(false);
          return;
        }

        // Success -> Update Profile
        const newBadge = {
          id: `gst_${Date.now()}`,
          type: 'gst' as const,
          number: d.gstin,
          issuedDate: new Date(),
          verifiedBy: 'QUICKO SANDBOX'
        };

        const currentBadges = user?.verificationBadges || [];
        await updateUserProfile({
          verificationBadges: [...currentBadges, newBadge],
          gstDetails: { ...d },
          isGstVerified: true,
          onboardingStep: 4 // Explicitly save step 4 to ensure they resume here
        });
      } else {
        setVerificationError(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('GST Verification Error:', error);
      setVerificationError('An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  // PAN Upload logic removed

  const handleVerifyPanAadhaar = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setAadhaarError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setIsAadhaarVerifying(true);
    setAadhaarError(null);

    try {
      const pan = user?.gstDetails?.pan;
      if (!pan) {
        setAadhaarError('GST details missing. Please verify GST first.');
        setIsAadhaarVerifying(false);
        return;
      }

      const result = await verifyPanAadhaarStatus(pan, aadhaarNumber);

      if (result.success && result.aadhaarSeedingStatus === 'y') {
        // Success -> Update Profile and Authorize
        const currentBadges = user?.verificationBadges || [];
        await updateUserProfile({
          verificationBadges: [
            ...currentBadges,
            {
              id: `aadhaar_link_${Date.now()}`,
              type: 'pan' as const,
              number: `linked_${aadhaarNumber.slice(-4)}`,
              issuedDate: new Date(),
              verifiedBy: 'SANDBOX KYC'
            }
          ],
          verificationStatus: 'verified',
          isAuthorized: true
        });
      } else {
        setAadhaarError(result.error || result.message || 'PAN is not linked to this Aadhaar.');
      }
    } catch (error) {
      setAadhaarError('Error verifying PAN-Aadhaar link.');
    } finally {
      setIsAadhaarVerifying(false);
    }
  };


  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-40">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Executive Onboarding</span>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tight">Document Upload</h1>
            <p className="text-on-surface-variant mt-4 text-lg max-w-2xl">
              Establish your sovereign identity. Provide the necessary legal credentials to unlock institutional deal execution capabilities.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-on-surface-variant text-sm font-medium mb-2">Step 4 of 5</span>
            <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="bg-primary w-[80%] h-full transition-all"></div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Trust Score Widget */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold">Trust Score Preview</h3>
                <span className="material-symbols-outlined text-primary">security</span>
              </div>
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle className="text-surface-container-high" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="352" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black font-headline">20%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Current Rating</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed text-center italic">
                Upload mandatory documents to increase score to 85% and unlock high-limit transactions.
              </p>
            </div>


          </div>

          {/* Document Upload Zones */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentSlots.map((doc) => (
              <div
                key={doc.id}
                className="col-span-12 bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20 hover:bg-orange-50/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-3xl">{doc.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${doc.badgeColor}`}>{doc.badge}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline text-2xl font-black mb-2">{doc.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed">{doc.desc}</p>
                  </div>

                  {isGstVerified ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block mb-1">Authenticated Entity</span>
                          <h4 className="text-xl font-bold text-emerald-900">{user?.gstDetails?.legalName}</h4>
                          <p className="text-sm text-emerald-600 font-medium mt-1">GST Number: {user?.gstDetails?.gstin}</p>
                        </div>
                      </div>

                      {/* Step 2: Link PAN with Aadhaar */}
                      <div className="border-t border-orange-100 pt-8 space-y-6">
                        {!isAadhaarVerified ? (
                          <div className="bg-white p-8 rounded-2xl border-2 border-orange-100 shadow-lg shadow-orange-100/20 space-y-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">fingerprint</span>
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-on-surface font-headline uppercase tracking-tight">Identity Linking Protocol</h4>
                                <p className="text-xs text-on-surface-variant">Match your digital signature with official tax records.</p>
                              </div>
                            </div>

                            <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100/50">
                              <p className="text-sm text-on-surface-variant leading-relaxed">
                                We have successfully derived your PAN (<span className="font-bold text-primary">{user?.gstDetails?.pan}</span>) from your GST record. To complete your identity profile, please provide your 12-digit Aadhaar number.
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  maxLength={12}
                                  value={aadhaarNumber}
                                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 12-digit Aadhaar Number"
                                  className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-xl px-6 py-4 text-lg font-bold tracking-[0.2em] focus:border-primary focus:outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-medium"
                                />
                                {aadhaarNumber.length === 12 && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <span className="material-symbols-outlined">check_circle</span>
                                  </div>
                                )}
                              </div>

                              {aadhaarError && (
                                <div className="flex items-center gap-2 text-red-500 px-2">
                                  <span className="material-symbols-outlined text-sm">error</span>
                                  <p className="text-xs font-bold">{aadhaarError}</p>
                                </div>
                              )}

                              <button
                                onClick={handleVerifyPanAadhaar}
                                disabled={isAadhaarVerifying || aadhaarNumber.length !== 12}
                                className="w-full py-5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                              >
                                {isAadhaarVerifying ? (
                                  <>
                                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                                    <span>Verifying Secure Link...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Execute Identity Link</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-8 flex items-center gap-6 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <div>
                              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block mb-1">Security Status: CLEAR</span>
                              <h4 className="text-xl font-bold text-emerald-900">Digital Identity Confirmed</h4>
                              <p className="text-sm text-emerald-600 font-medium mt-1">Sovereign identity link established successfully.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-4">
                        <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Company Credentials</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={gstin}
                              onChange={(e) => setGstin(e.target.value.toUpperCase())}
                              placeholder="GST Number"
                              className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none transition-all placeholder:tracking-normal placeholder:text-on-surface-variant/40"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/30">business</span>
                          </div>
                          <div className="relative">
                            <select
                              value={selectedState}
                              onChange={(e) => setSelectedState(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Region</option>
                              {STATE_NAMES.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/30 pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {verificationError && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                          <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
                          <p className="text-xs text-red-600 font-bold leading-relaxed">{verificationError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleVerifyGST}
                        disabled={isVerifying || !gstin || !selectedState}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-primary transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isVerifying ? (
                          <>
                            <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify GST Protocol</span>
                            <span className="material-symbols-outlined text-sm">verified</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <footer className="mt-16 flex justify-end gap-4">
          <button
            onClick={() => router.push('/onboarding/discovery')}
            className="px-8 py-4 rounded-full font-headline text-sm font-bold text-primary hover:bg-primary/5 transition-all"
          >
            Save Progress
          </button>
          <button
            onClick={async () => {
              setIsSaving(true);
              try {
                const success = await updateUserProfile({ onboardingStep: 5 });
                if (success) {
                  router.push('/onboarding/verify');
                } else {
                  alert('Failed to save progress. Please try again.');
                }
              } catch (error) {
                console.error('Error saving document progress:', error);
                alert('An error occurred. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || !isGstVerified || !isAadhaarVerified || authLoading || !user}
            className="px-10 py-4 rounded-full font-headline text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {isSaving ? 'Finishing...' : authLoading ? 'Loading Profile...' : 'Complete Upload Stage'}
          </button>
        </footer>

        {/* Floating HUD */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md px-8 py-4 rounded-full flex items-center gap-12 border border-white/20 shadow-2xl z-50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isGstVerified && isAadhaarVerified ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-bold font-headline text-on-surface">
              {isGstVerified && isAadhaarVerified ? 'Verification Done' : (isGstVerified ? 'Aadhaar Link Pending' : 'GST Pending')}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
            <span className="text-xs text-on-surface-variant">Reviewing typically takes 2-4 hours.</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
