'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { validatePassword, isValidEmail } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    requirements: { length: false, uppercase: false, lowercase: false, number: false, special: false }
  });

  useEffect(() => {
    setPasswordStrength(validatePassword(password));
  }, [password]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      isValidEmail(email) &&
      passwordStrength.isValid &&
      password === confirmPassword
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all as touched to show any hidden errors
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid()) {
      setError('Please fix the errors in the form.');
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
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
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
              unoptimized
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

            {/* Password */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background ${
                  touched.password && !passwordStrength.isValid ? 'border-error' : 'border-outline-variant'
                }`}
              />
              {/* Password Strength Meter */}
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
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-background ${
                  touched.confirmPassword && password !== confirmPassword ? 'border-error' : 'border-outline-variant'
                }`}
              />
              {touched.confirmPassword && password !== confirmPassword && (
                <p className="text-error text-xs mt-1">Passwords do not match</p>
              )}
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
              disabled={loading || !isFormValid()}
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
