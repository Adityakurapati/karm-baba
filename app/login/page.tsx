'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithProvider, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { resetPassword } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.isOnboarded && user?.isAuthorized) {
        router.push('/dashboard');
      } else if (user?.isOnboarded && !user?.isAuthorized) {
        // If they are onboarded but not authorized, send them back to documents for verification
        router.push('/onboarding/documents');
      } else {
        const step = user?.onboardingStep || 1;
        switch (step) {
          case 1: router.push('/onboarding'); break;
          case 2: router.push('/onboarding/industry'); break;
          case 3: router.push('/onboarding/discovery'); break;
          case 4: router.push('/onboarding/documents'); break;
          case 5: router.push('/onboarding/verify'); break;
          default: router.push('/onboarding');
        }
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Keep loading true while the useEffect handles redirection
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    
    if (!email) {
      setError('Please enter your email address to reset password');
      return;
    }
    
    setLoading(true);
    try {
      const success = await resetPassword(email);
      if (success) {
        setResetSent(true);
      } else {
        setError('Failed to send reset email. Make sure the email is registered.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (providerName: 'google' | 'microsoft' | 'facebook') => {
    setError('');
    setLoading(true);
    try {
      const success = await loginWithProvider(providerName);
      if (!success) {
        setError(`Failed to sign in with ${providerName}.`);
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
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
              unoptimized
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
          {resetSent && (
            <div className="p-4 bg-green-50 border border-green-500 text-green-700 rounded-lg text-sm font-bold">
              Password reset email sent! Please check your inbox.
            </div>
          )}



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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined notranslate text-xl" translate="no">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
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
            <button onClick={handleResetPassword} type="button" className="text-sm text-primary hover:underline font-bold">
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-on-surface-variant font-bold">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleProviderLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50 font-bold"
            >
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleProviderLogin('microsoft')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50 font-bold"
            >
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/microsoft.svg" alt="Microsoft" width={20} height={20} />
              Continue with Microsoft
            </button>
            <button
              type="button"
              onClick={() => handleProviderLogin('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50 font-bold"
            >
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" width={20} height={20} />
              Continue with Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-on-surface-variant mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-bold">
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
