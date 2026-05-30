'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type UserRole = 'buyer' | 'seller';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strength = Object.values(requirements).filter(Boolean).length;
  return { isValid: strength === 5, strength, requirements };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithProvider } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role] = useState<UserRole>('buyer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    strength: 0,
    requirements: { length: false, uppercase: false, lowercase: false, number: false, special: false },
  });

  useEffect(() => {
    setPasswordStrength(validatePassword(password));
  }, [password]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    if (!showVerification && !isEmailVerified) {
      return firstName.trim() !== '' && lastName.trim() !== '' && isValidEmail(email);
    }
    if (showVerification && !isEmailVerified) {
      return verificationCode.length === 6;
    }
    return passwordStrength.isValid && password === confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!showVerification && !isEmailVerified) {
      setTouched((prev) => ({ ...prev, firstName: true, lastName: true, email: true }));
    } else if (isEmailVerified) {
      setTouched((prev) => ({ ...prev, password: true, confirmPassword: true }));
    }

    if (!isFormValid()) {
      setError('Please fix the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      if (!showVerification && !isEmailVerified) {
        const response = await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setShowVerification(true);
          setResendTimer(60);
        } else {
          setError(data.error || 'Failed to send verification code.');
        }
      } else if (showVerification && !isEmailVerified) {
        const response = await fetch('/api/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, verificationCode }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsEmailVerified(true);
        } else {
          setError(data.error || 'Invalid verification code.');
        }
      } else {
        const success = await register(email, password, firstName, lastName, role, verificationCode);
        if (success) {
          router.push('/onboarding');
        } else {
          setError('Registration failed. Code might be invalid or email already in use.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setResendTimer(60);
      } else {
        setError(data.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'microsoft' | 'facebook') => {
    setLoading(true);
    try {
      await loginWithProvider(provider);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Provider login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-3xl shadow-soft">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="KARM BABA" width={60} height={60} unoptimized />
          </Link>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            Create Your Account
          </h2>
          <p className="text-on-surface-variant">
            Join the Global Marketplace for Buyers and Sellers
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Stage 1: Name + Email */}
          {!showVerification && !isEmailVerified && (
            <>
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
                    onBlur={() => handleBlur('firstName')}
                    placeholder="John"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background ${
                      touched.firstName && !firstName.trim() ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  {touched.firstName && !firstName.trim() && (
                    <p className="text-error text-xs mt-1">First name is required</p>
                  )}
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
                    onBlur={() => handleBlur('lastName')}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background ${
                      touched.lastName && !lastName.trim() ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  {touched.lastName && !lastName.trim() && (
                    <p className="text-error text-xs mt-1">Last name is required</p>
                  )}
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
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background ${
                    touched.email && !isValidEmail(email) ? 'border-error' : 'border-outline-variant'
                  }`}
                />
                {touched.email && !isValidEmail(email) && (
                  <p className="text-error text-xs mt-1">Please enter a valid email address</p>
                )}
              </div>
            </>
          )}

          {/* Stage 2: Verification Code */}
          {showVerification && !isEmailVerified && (
            <div className="p-6 bg-surface-variant/50 rounded-xl border border-primary/20 animate-fade-in">
              <h3 className="font-headline font-bold text-lg mb-2">Verify your email</h3>
              <p className="text-sm text-on-surface-variant mb-4">
                We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below to verify.
              </p>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background border-outline-variant text-center tracking-[0.5em] text-xl font-bold"
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || loading}
                  className="text-sm text-primary hover:underline font-bold disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Password */}
          {isEmailVerified && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined notranslate" translate="no">verified</span>
                Email verified successfully!
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background pr-12 ${
                      touched.password && !passwordStrength.isValid ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined notranslate text-xl" translate="no">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-on-surface-variant">Password Strength</span>
                      <span className="text-xs font-bold text-primary">
                        {['Weak', 'Fair', 'Good', 'Strong', 'Excellent'][Math.max(0, passwordStrength.strength - 1)]}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full ${
                            level <= passwordStrength.strength
                              ? passwordStrength.strength <= 2
                                ? 'bg-error'
                                : passwordStrength.strength <= 3
                                ? 'bg-yellow-400'
                                : 'bg-green-500'
                              : 'bg-outline-variant/30'
                          }`}
                        />
                      ))}
                    </div>
                    <ul className="mt-2 text-xs text-on-surface-variant space-y-1">
                      <li className={passwordStrength.requirements.length ? 'text-green-500' : ''}>
                        {passwordStrength.requirements.length ? '✓' : '○'} Minimum 8 characters
                      </li>
                      <li className={passwordStrength.requirements.uppercase ? 'text-green-500' : ''}>
                        {passwordStrength.requirements.uppercase ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={passwordStrength.requirements.lowercase ? 'text-green-500' : ''}>
                        {passwordStrength.requirements.lowercase ? '✓' : '○'} One lowercase letter
                      </li>
                      <li className={passwordStrength.requirements.number ? 'text-green-500' : ''}>
                        {passwordStrength.requirements.number ? '✓' : '○'} One number
                      </li>
                      <li className={passwordStrength.requirements.special ? 'text-green-500' : ''}>
                        {passwordStrength.requirements.special ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background pr-12 ${
                      touched.confirmPassword && password !== confirmPassword ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined notranslate text-xl" translate="no">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {touched.confirmPassword && password !== confirmPassword && (
                  <p className="text-error text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg shadow-lg shadow-primary/20"
          >
            {loading
              ? !showVerification
                ? 'Sending Code...'
                : !isEmailVerified
                ? 'Verifying Code...'
                : 'Creating Account...'
              : !showVerification
              ? 'Send Verification Code'
              : !isEmailVerified
              ? 'Verify Code'
              : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-on-surface-variant font-bold">OR</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={() => handleProviderLogin('google')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-50 font-bold"
        >
          <Image
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Sign up with Google
        </button>

        {/* Login Link */}
        <p className="text-center text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </p>

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
