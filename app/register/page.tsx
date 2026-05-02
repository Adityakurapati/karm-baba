'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await register(email, password, firstName, lastName, role);
      if (success) {
        router.push('/onboarding');
      } else {
        setError('Registration failed. Email might already be in use.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="KARM BABA Logo"
              width={60}
              height={60}
              className="h-16 w-16 mx-auto"
              priority
            />
          </Link>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            Create Your Account
          </h2>
          <p className="text-on-surface-variant">
            Join the global marketplace for buyers and sellers
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error/10 border border-error text-error rounded-lg text-sm font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-background"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-background"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-background"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-background"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-4">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    role === 'buyer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant hover:border-primary/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-1">shopping_cart</span>
                  <span className="font-bold">Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    role === 'seller'
                      ? 'border-secondary bg-secondary/5 text-secondary'
                      : 'border-outline-variant hover:border-secondary/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-1">factory</span>
                  <span className="font-bold">Seller</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg shadow-lg shadow-primary/20"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>

            {/* Login Link */}
            <p className="text-center text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-on-surface-variant">
          <p>
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
