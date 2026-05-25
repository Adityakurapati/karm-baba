'use client';

import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { GST_STATE_CODES, STATE_NAMES } from '@/lib/gst-codes';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { GSTIN_REGEX } from '@/lib/sandbox';

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

  // User role
  const isIndividual = user?.role === 'individual';

  // GST State (for Business)
  const [gstin, setGstin] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');

  // PAN / Aadhar State (for Non-Business / Individual)
  const [pan, setPan] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [linkageChecked, setLinkageChecked] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  // Check if verified
  const isGstVerified = user?.isGstVerified || user?.verificationBadges?.some(b => b.type === 'gst' || b.type === 'pan');

  const handleVerifyGST = async () => {
    if (!gstin || !selectedState || !companyName) {
      setVerificationError('Please enter GST Number, State, and Company/Trade Name.');
      return;
    }

    const stateCode = GST_STATE_CODES[selectedState];
    if (!stateCode) {
      setVerificationError('Invalid state selected.');
      return;
    }

    if (gstin.substring(0, 2) !== stateCode) {
      setVerificationError(`GST Number does not belong to the selected state. Expected code ${stateCode} for ${selectedState}.`);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    try {
      const usersRef = ref(database, 'users');
      const gstQuery = query(usersRef, orderByChild('gstDetails/gstin'), equalTo(gstin.toUpperCase()));
      const snapshot = await get(gstQuery);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const otherUserId = Object.keys(users).find(id => id !== user?.id);
        if (otherUserId) {
          setVerificationError('This GST Number is already registered with another account.');
          toast.error('GST Number already registered');
          setIsVerifying(false);
          return;
        }
      }

      const res = await fetch('/api/verify-gst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gstin }),
      });

      if (!res.ok) {
        throw new Error('GST API failed');
      }

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;

        if (d.status.toLowerCase().includes('cancelled')) {
          setVerificationError(`GSTIN is Cancelled. Reason: ${d.status}`);
          toast.error(`GSTIN is Cancelled`);
          setIsVerifying(false);
          return;
        }

        if (d.tradeName?.toLowerCase() !== companyName.trim().toLowerCase()) {
          setVerificationError(`Trade Name mismatch. Expected: ${d.tradeName}`);
          toast.error(`Trade Name mismatch`);
          setIsVerifying(false);
          return;
        }

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
          verificationStatus: 'verified',
          isAuthorized: true,
          onboardingStep: 4
        });

        toast.success('GST Verification Successful');
      } else {
        setVerificationError(result.error || 'Verification failed');
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('GST Verification Error:', error);
      setVerificationError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  // Sandbox linkage check (Step 1 of Individual Identity)
  const handleCheckLinkage = async () => {
    if (!pan || !aadhar) {
      setVerificationError('Please enter both PAN and Aadhar Numbers.');
      return;
    }
    if (pan.length !== 10) {
      setVerificationError('PAN must be exactly 10 characters.');
      return;
    }
    if (aadhar.length !== 12) {
      setVerificationError('Aadhar must be exactly 12 digits.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const res = await fetch('/api/verify-pan-aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan: pan.toUpperCase(), aadhaar: aadhar }),
      });
      const result = await res.json();
      
      if (result.success && result.aadhaarSeedingStatus?.toLowerCase() === 'y') {
        setLinkageChecked(true);
        toast.success('PAN-Aadhar Linkage Verified successfully');
      } else {
        setVerificationError(result.message || 'PAN and Aadhaar are not linked or invalid.');
        toast.error('Linkage Check Failed');
      }
    } catch (error) {
      setVerificationError('An error occurred during linkage verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Sandbox OTP trigger (Step 2 of Individual Identity)
  const handleSendAadharOtp = async () => {
    setIsVerifying(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/send-aadhaar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar: aadhar }),
      });
      const result = await res.json();
      
      if (result.success && result.reference_id) {
        setReferenceId(result.reference_id);
        setOtpSent(true);
        toast.success(`OTP sent to mobile linked with Aadhar ${aadhar.slice(-4)}`);
      } else {
        toast.error(result.error || result.message || 'Failed to send OTP. Please try again.');
        setOtpError(result.error || result.message || 'Failed to send OTP.');
      }
    } catch (error) {
      toast.error('An error occurred sending OTP.');
      setOtpError('An error occurred sending OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Sandbox OTP verification (Step 3 of Individual Identity)
  const handleVerifyAadharOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Invalid verification code.');
      return;
    }

    if (!referenceId) {
      setOtpError('OTP session expired. Please resend.');
      return;
    }

    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/verify-aadhaar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, otp: otpCode }),
      });
      const result = await res.json();
      
      if (result.success && result.data?.status === 'VALID') {
        const newBadge = {
          id: `pan_${Date.now()}`,
          type: 'pan' as const,
          number: pan.toUpperCase(),
          issuedDate: new Date(),
          verifiedBy: 'UIDAI LINKED SANDBOX'
        };

        const currentBadges = user?.verificationBadges || [];
        const success = await updateUserProfile({
          verificationBadges: [...currentBadges, newBadge],
          isGstVerified: true,
          verificationStatus: 'verified',
          isAuthorized: true,
          onboardingStep: 4,
          gstDetails: {
            gstin: 'INDIVIDUAL_MOCK',
            legalName: `${user?.firstName || ''} ${user?.lastName || ''}`,
            tradeName: `${user?.firstName || ''} ${user?.lastName || ''}`,
            registrationDate: new Date().toISOString(),
            status: 'Active',
            address: 'Verified Individual Profile',
            type: 'Individual',
            pan: pan.toUpperCase(),
          }
        });

        if (success) {
          toast.success('Individual Identity Verified successfully!');
        } else {
          toast.error('Failed to update profile. Please try again.');
        }
      } else {
        setOtpError(result.error || result.message || 'Verification failed. Please check OTP.');
      }
    } catch (error) {
      setOtpError('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-40">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Executive Onboarding</span>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tight">
              {isIndividual ? 'Identity Verification' : 'Document Upload'}
            </h1>
            <p className="text-on-surface-variant mt-4 text-lg max-w-2xl">
              {isIndividual 
                ? 'Verify your individual identity credentials using the Aadhar-PAN linkage sandbox to unlock ecosystem participation.'
                : 'Establish your commercial identity. Provide the necessary tax credentials to unlock high-limit trade transactions.'
              }
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
          {/* Trust Score Preview */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold">Trust Score Preview</h3>
                <span className="material-symbols-outlined notranslate text-primary" translate="no">security</span>
              </div>
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle className="text-surface-container-high" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary transition-all duration-1000" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset={440 - (440 * (isGstVerified ? 85 : 35)) / 100} strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black font-headline">{isGstVerified ? 85 : 35}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Current Rating</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed text-center italic">
                {isGstVerified 
                  ? "Identity verified! Proceed to complete remaining verification metrics."
                  : "Complete current step credentials to raise your rating to 85%."}
              </p>
            </div>
          </div>

          {/* Verification Forms */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20">
              
              {/* Individual / Non-Business Verification UI */}
              {isIndividual ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <span className="material-symbols-outlined notranslate text-primary text-3xl" translate="no">fingerprint</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl font-black">Individual Identity Protocol</h3>
                      <p className="text-sm text-on-surface-variant">Validate your PAN &amp; Aadhar credentials to securely link details.</p>
                    </div>
                  </div>

                  {isGstVerified ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined notranslate text-4xl" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block mb-1">Authenticated Individual</span>
                        <h4 className="text-xl font-bold text-emerald-900">{user?.firstName} {user?.lastName}</h4>
                        <p className="text-sm text-emerald-600 font-medium mt-1">PAN Number: {user?.gstDetails?.pan}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Step A: Linkage Details Input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 ml-1">PAN Number</label>
                          <input
                            type="text"
                            value={pan}
                            onChange={(e) => setPan(e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            disabled={linkageChecked}
                            className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none uppercase disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Aadhar Number</label>
                          <input
                            type="text"
                            value={aadhar}
                            onChange={(e) => setAadhar(e.target.value)}
                            placeholder="12-digit Aadhar"
                            disabled={linkageChecked}
                            className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {verificationError && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                          <span className="material-symbols-outlined notranslate text-red-500 text-sm mt-0.5" translate="no">error</span>
                          <p className="text-xs text-red-600 font-bold leading-relaxed">{verificationError}</p>
                        </div>
                      )}

                      {/* Linkage Button */}
                      {!linkageChecked && (
                        <button
                          onClick={handleCheckLinkage}
                          disabled={isVerifying || pan.length !== 10 || aadhar.length !== 12}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isVerifying ? (
                            <>
                              <span className="animate-spin material-symbols-outlined notranslate text-sm" translate="no">sync</span>
                              <span>Checking Linkage...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify PAN-Aadhar Linkage</span>
                              <span className="material-symbols-outlined notranslate text-sm" translate="no">link</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Step B: OTP Dispatch and Validation */}
                      {linkageChecked && (
                        <div className="border-t border-slate-100 pt-6 space-y-6 animate-in fade-in duration-500">
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined notranslate text-emerald-600 text-sm" translate="no">check_circle</span>
                            <p className="text-xs text-emerald-800 font-bold">Linkage established successfully! Please verify registered mobile details.</p>
                          </div>

                          {!otpSent ? (
                            <button
                              onClick={handleSendAadharOtp}
                              disabled={isVerifying}
                              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
                            >
                              {isVerifying ? (
                                <>
                                  <span className="animate-spin material-symbols-outlined notranslate text-sm" translate="no">sync</span>
                                  <span>Sending Code...</span>
                                </>
                              ) : (
                                <>
                                  <span>Send OTP to Aadhar Registered Mobile</span>
                                  <span className="material-symbols-outlined notranslate text-sm" translate="no">sms</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Aadhar OTP Code</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter 6-digit OTP"
                                  value={otpCode}
                                  onChange={(e) => setOtpCode(e.target.value)}
                                  className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none"
                                />
                                <button
                                  onClick={handleVerifyAadharOtp}
                                  disabled={isVerifying || otpCode.length !== 6}
                                  className="px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                                >
                                  {isVerifying && <span className="animate-spin material-symbols-outlined notranslate text-xs" translate="no">sync</span>}
                                  Verify
                                </button>
                              </div>

                              {otpError && (
                                <p className="text-xs text-red-600 font-bold">{otpError}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              ) : (
                /* Business / GST Verification UI */
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <span className="material-symbols-outlined notranslate text-primary text-3xl" translate="no">description</span>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">MANDATORY</span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-headline text-2xl font-black mb-2">GST Registration</h3>
                      <p className="text-on-surface-variant leading-relaxed">Official certificate issued by the tax authority. Your PAN will be derived automatically from this.</p>
                    </div>

                    {isGstVerified ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined notranslate text-4xl" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block mb-1">Authenticated Entity</span>
                          <h4 className="text-xl font-bold text-emerald-900">{user?.gstDetails?.legalName}</h4>
                          <p className="text-sm text-emerald-600 font-medium mt-1">GST Number: {user?.gstDetails?.gstin}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="space-y-4">
                          <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Company Credentials</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2 relative">
                              <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Exact Company / Trade Name"
                                className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none transition-all placeholder:tracking-normal placeholder:text-on-surface-variant/40"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">domain</span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                placeholder="GST Number"
                                className="w-full bg-slate-50 border-2 border-outline-variant/30 rounded-2xl px-6 py-4 text-sm font-bold tracking-widest focus:border-primary focus:outline-none transition-all placeholder:tracking-normal placeholder:text-on-surface-variant/40"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">business</span>
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
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30 pointer-events-none" translate="no">expand_more</span>
                            </div>
                          </div>
                        </div>

                        {verificationError && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined notranslate text-red-500 text-sm mt-0.5" translate="no">error</span>
                            <p className="text-xs text-red-600 font-bold leading-relaxed">{verificationError}</p>
                          </div>
                        )}

                        <button
                          onClick={handleVerifyGST}
                          disabled={isVerifying || !GSTIN_REGEX.test(gstin) || !selectedState || !companyName}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-primary transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isVerifying ? (
                            <>
                              <span className="animate-spin material-symbols-outlined notranslate text-sm" translate="no">sync</span>
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify GST Protocol</span>
                              <span className="material-symbols-outlined notranslate text-sm" translate="no">verified</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
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
            disabled={isSaving || !isGstVerified || authLoading || !user}
            className="px-10 py-4 rounded-full font-headline text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {isSaving ? 'Finishing...' : authLoading ? 'Loading Profile...' : 'Complete Upload Stage'}
          </button>
        </footer>

        {/* Floating HUD */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md px-8 py-4 rounded-full flex items-center gap-12 border border-white/20 shadow-2xl z-50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isGstVerified ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-bold font-headline text-on-surface">
              {isGstVerified ? 'Verification Done' : 'Credentials Pending'}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined notranslate text-sm text-on-surface-variant" translate="no">info</span>
            <span className="text-xs text-on-surface-variant">Reviewing typically takes 2-4 hours.</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
