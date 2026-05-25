'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';

function AccountFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  
  // Detect role from search params or fallback to user role or 'buyer'
  const role = searchParams.get('role') || user?.role || 'buyer';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Pre-populate fields from the current logged-in user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.company?.name || '',
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const sanitizedPhone = formData.phone.trim().replace(/[\s\-()]/g, '');
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        newErrors.phone = 'Invalid format. Provide a valid 10-15 digit number (e.g., +91 98765 43210)';
      }
    }
    
    if (role !== 'individual' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (role !== 'individual' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    // Save to user profile via updateUserProfile
    const success = await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      company: {
        ...(user?.company || { id: '', name: '', registrationNumber: '', industry: '', location: '', employees: 0, yearEstablished: 0 }),
        name: role === 'individual' ? `${formData.firstName} ${formData.lastName}` : formData.companyName,
      },
      onboardingStep: 3, // proceed to Step 3: Discovery & Sectors
    });

    setLoading(false);

    if (success) {
      router.push('/onboarding/discovery');
    } else {
      alert('Failed to save details. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-sm max-w-2xl">
      {/* Role Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-headline font-bold uppercase tracking-wider">
        <span className="material-symbols-outlined notranslate text-sm" translate="no">verified_user</span>
        {role.charAt(0).toUpperCase() + role.slice(1)} Profile Setup
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
          />
          {errors.firstName && <p className="text-error text-xs mt-1 font-bold">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
          />
          {errors.lastName && <p className="text-error text-xs mt-1 font-bold">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-outline-variant/20 rounded-xl bg-slate-50 text-on-surface-variant cursor-not-allowed font-medium"
          />
          <p className="text-[10px] text-on-surface-variant mt-1">Email is tied to your account credentials</p>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
          />
          {errors.phone && <p className="text-error text-xs mt-1 font-bold">{errors.phone}</p>}
        </div>
      </div>

      {/* Conditional Fields based on Role */}
      {role !== 'individual' && (
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
            Company Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Acme Industrial Ltd."
              className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">domain</span>
          </div>
          {errors.companyName && <p className="text-error text-xs mt-1 font-bold">{errors.companyName}</p>}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || authLoading}
        className="w-full py-4 text-white font-headline font-bold rounded-xl transition-all shadow-lg hover:scale-[1.01] hover:shadow-primary/20 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
      >
        {loading ? 'Saving Details...' : 'Save & Proceed to Discovery'}
      </button>
    </form>
  );
}

export default function AccountPage() {
  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-32">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Identity Setup</span>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tight">Account Details</h1>
            <p className="text-on-surface-variant mt-2 text-lg max-w-2xl">
              Provide your personal, business, or entity contact details. These parameters are used to secure your verified trade credentials.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-on-surface-variant text-sm font-medium mb-2">Step 2 of 5</span>
            <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="bg-primary w-2/5 h-full transition-all"></div>
            </div>
          </div>
        </header>

        {/* Form Container */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface-variant font-bold">Loading Account Form...</p>
          </div>
        }>
          <AccountFormContent />
        </Suspense>
      </div>
    </OnboardingLayout>
  );
}
