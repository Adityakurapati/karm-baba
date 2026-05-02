'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function VerificationContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'buyer';

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [documentsUploaded, setDocumentsUploaded] = useState<string[]>([]);

  const handleVerifyOTP = async () => {
    if (otp === '123456') {
      setStep(2);
    }
  };

  const handleDocumentUpload = (doc: string) => {
    setDocumentsUploaded((prev) => [...prev, doc]);
  };

  const handleCompleteVerification = () => {
    router.push(user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold ${
                s <= step
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 w-12 mx-2 ${
                  s < step ? 'bg-primary' : 'bg-surface-container'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Email/OTP Verification */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
              Verify Your Email
            </h2>
            <p className="text-on-surface-variant">
              We&apos;ve sent a verification code to your email
            </p>
          </div>

          <div className="bg-surface-container p-4 rounded-lg">
            <p className="text-sm text-on-surface-variant mb-4">
              test@example.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-headline font-bold text-on-surface mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-center text-2xl tracking-widest"
            />
            <p className="text-sm text-on-surface-variant mt-2">
              Demo: Use 123456
            </p>
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={otp.length < 6}
            className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* Step 2: Document Upload */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
              Upload Documents
            </h2>
            <p className="text-on-surface-variant">
              Help us verify your business information
            </p>
          </div>

          <div className="space-y-3">
            {['Business License', 'Tax ID', 'Company Registration'].map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container transition-colors"
                onClick={() => handleDocumentUpload(doc)}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    documentsUploaded.includes(doc)
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant'
                  }`}
                >
                  {documentsUploaded.includes(doc) && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-on-surface">{doc}</p>
                  <p className="text-sm text-on-surface-variant">
                    {documentsUploaded.includes(doc) ? 'Uploaded' : 'Click to upload'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={documentsUploaded.length < 2}
            className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Verification Complete */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-headline font-black text-on-surface">
            Verification Complete!
          </h2>
          <p className="text-on-surface-variant">
            Your account is now active and verified. Welcome to KARM BABA!
          </p>

          <button
            onClick={handleCompleteVerification}
            className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}
