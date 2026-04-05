'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    // Demo credentials
    if (email === 'demo@example.com' && password === 'password') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
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
            />
          </Link>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant">
            Sign in to access your deals and network
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 border border-error text-error rounded-lg text-sm font-bold">
              {error}
            </div>
          )}

          {/* Demo Credentials Note */}
          <div className="p-4 bg-primary/10 border border-primary rounded-lg text-sm">
            <p className="font-bold text-primary mb-2">Demo Credentials:</p>
            <p className="text-on-surface-variant">Email: demo@example.com</p>
            <p className="text-on-surface-variant">Password: password</p>
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
              className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
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
              className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">
                Remember me
              </label>
            </div>
            <Link href="#" className="text-sm text-primary hover:underline font-bold">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/onboarding" className="text-primary hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-outline-variant text-center text-sm text-on-surface-variant">
          <p>
            By signing in, you agree to our{' '}
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
