'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { PlatformLead } from '@/lib/types';
import toast from 'react-hot-toast';

export default function LeadLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !code) {
      setError('Please enter both phone number and login code');
      return;
    }

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const leadsRef = ref(database, 'leads');
      const q = query(leadsRef, orderByChild('phone'), equalTo(phone));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        let found = false;
        snapshot.forEach((childSnapshot) => {
          const leadData = childSnapshot.val() as PlatformLead;
          if (leadData.code === code) {
            found = true;
            // Set session
            const leadSession = {
              id: childSnapshot.key,
              name: leadData.name,
              role: 'lead',
              assignmentType: leadData.assignmentType
            };
            localStorage.setItem('lead_session', JSON.stringify(leadSession));
            toast.success('Login successful!');
            router.push('/lead/dashboard');
          }
        });

        if (!found) {
          setError('Invalid phone number or code');
          setLoading(false);
        }
      } else {
        setError('Invalid phone number or code');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="KARM BABA Logo"
              width={60}
              height={60}
              className="h-20 w-20 mx-auto"
              priority
              unoptimized
            />
          </Link>
          <div className="inline-flex items-center gap-2 mb-3 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined notranslate text-sm" translate="no">stars</span>
            Lead Portal
          </div>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            Lead Login
          </h2>
          <p className="text-on-surface-variant">
            Sign in to access your assigned buyers and sellers
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-xl shadow-primary/5 border border-outline-variant/20 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm font-bold flex items-start gap-2">
                <span className="material-symbols-outlined notranslate text-lg shrink-0" translate="no">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" translate="no">phone_iphone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(numericVal);
                  }}
                  placeholder="10-digit number"
                  className="w-full pl-12 pr-4 py-3.5 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Login Code
              </label>
              <div className="relative">
                <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" translate="no">password</span>
                <input
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code"
                  className="w-full pl-12 pr-12 py-3.5 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                >
                  <span className="material-symbols-outlined notranslate text-xl" translate="no">
                    {showCode ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <span className="material-symbols-outlined notranslate text-lg" translate="no">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-on-surface-variant font-medium">
          <p>
            Having trouble? Contact your admin to reset your code.
          </p>
        </div>
      </div>
    </div>
  );
}
