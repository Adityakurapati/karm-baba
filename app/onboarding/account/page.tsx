'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AccountFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'buyer';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    country: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    // Store in localStorage for demo
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(formData));

    // Redirect to next step
    router.push(`/onboarding/verification?role=${role}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Badge */}
      <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-headline font-bold">
        {role.charAt(0).toUpperCase() + role.slice(1)} Account
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
          />
          {errors.firstName && <p className="text-error text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
          />
          {errors.lastName && <p className="text-error text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-headline font-bold text-on-surface mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
        />
        {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
          />
          {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-headline font-bold text-on-surface mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
          />
          {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-headline font-bold text-on-surface mb-2">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
        />
        {errors.companyName && <p className="text-error text-sm mt-1">{errors.companyName}</p>}
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-headline font-bold text-on-surface mb-2">
          Country
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
        >
          <option value="">Select a country</option>
          <option value="usa">United States</option>
          <option value="china">China</option>
          <option value="india">India</option>
          <option value="uk">United Kingdom</option>
          <option value="germany">Germany</option>
          <option value="japan">Japan</option>
          <option value="dubai">United Arab Emirates</option>
        </select>
        {errors.country && <p className="text-error text-sm mt-1">{errors.country}</p>}
      </div>

      {/* Terms */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="w-4 h-4 rounded border-outline-variant"
        />
        <label className="text-sm text-on-surface-variant">
          I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
          <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
        </label>
      </div>
      {errors.agreeTerms && <p className="text-error text-sm">{errors.agreeTerms}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Login Link */}
      <p className="text-center text-on-surface-variant">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-bold">
          Log In
        </Link>
      </p>
    </form>
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Create Your Account
          </h1>
          <p className="text-on-surface-variant">
            Join thousands of traders and suppliers worldwide
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={<div>Loading...</div>}>
          <AccountFormContent />
        </Suspense>
      </div>
    </div>
  );
}
