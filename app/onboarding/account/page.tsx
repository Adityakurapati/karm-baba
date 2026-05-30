'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { STATE_NAMES } from '@/lib/gst-codes';
import PhoneInput from '@/components/PhoneInput';

function AccountFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  
  // Detect role from search params or fallback to user role or 'buyer'
  const role = searchParams.get('role') || user?.role || 'buyer';

  const [activeSubTab, setActiveSubTab] = useState<'account' | 'organization'>('account');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    // Detailed Organization Fields:
    gstin: '',
    entityType: '',
    registrationNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    employeesRange: '',
    yearEstablished: '',
    turnoverRange: '',
    website: '',
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

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
        // Detailed organization fields
        gstin: user.gstDetails?.gstin || (user.company as any)?.gstin || '',
        entityType: (user.company as any)?.entityType || '',
        registrationNumber: user.company?.registrationNumber || '',
        addressLine1: (user.company as any)?.addressLine1 || '',
        addressLine2: (user.company as any)?.addressLine2 || '',
        city: (user.company as any)?.city || '',
        state: (user.company as any)?.state || '',
        pinCode: (user.company as any)?.pinCode || '',
        employeesRange: (user.company as any)?.employeesRange || '',
        yearEstablished: user.company?.yearEstablished ? String(user.company.yearEstablished) : '',
        turnoverRange: (user.company as any)?.turnoverRange || '',
        website: user.company?.website || '',
      }));
    }
  }, [user]);

  const validateAccountTab = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      newErrors.phone = 'A valid 10-digit mobile number is required';
    } else if (!isPhoneVerified) {
      newErrors.phone = 'Please verify your mobile number with OTP before proceeding';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrgTab = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.entityType.trim()) newErrors.entityType = 'Entity type is required';
    
    if (formData.gstin.trim()) {
      const formattedGstin = formData.gstin.trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formattedGstin)) {
        newErrors.gstin = 'Invalid GSTIN format (e.g., 27AAAAA1111A1Z1)';
      }
    } else {
      newErrors.gstin = 'GSTIN is required';
    }

    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Registered address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'PIN Code must be exactly 6 digits';
    }

    if (formData.yearEstablished.trim()) {
      const year = parseInt(formData.yearEstablished.trim());
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.yearEstablished = `Please enter a valid year (1800 - ${currentYear})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First validate account details tab
    if (!validateAccountTab()) {
      setActiveSubTab('account');
      return;
    }

    // Validate organization details tab if role is not individual
    if (role !== 'individual' && !validateOrgTab()) {
      setActiveSubTab('organization');
      return;
    }

    setLoading(true);
    
    const companyData = {
      ...(user?.company || { id: '', name: '', registrationNumber: '', industry: '', location: '', employees: 0, yearEstablished: 0 }),
      name: role === 'individual' ? `${formData.firstName} ${formData.lastName}` : formData.companyName,
      registrationNumber: role === 'individual' ? '' : formData.registrationNumber,
      gstin: role === 'individual' ? '' : formData.gstin.toUpperCase(),
      entityType: role === 'individual' ? '' : formData.entityType,
      addressLine1: role === 'individual' ? '' : formData.addressLine1,
      addressLine2: role === 'individual' ? '' : formData.addressLine2,
      city: role === 'individual' ? '' : formData.city,
      state: role === 'individual' ? '' : formData.state,
      pinCode: role === 'individual' ? '' : formData.pinCode,
      employeesRange: role === 'individual' ? '' : formData.employeesRange,
      employees: role === 'individual' ? 0 : (formData.employeesRange ? parseInt(formData.employeesRange.split('-')[0]) || 0 : 0),
      yearEstablished: role === 'individual' ? 0 : parseInt(formData.yearEstablished) || 0,
      turnoverRange: role === 'individual' ? '' : formData.turnoverRange,
      website: role === 'individual' ? '' : formData.website,
    };

    // Save to user profile via updateUserProfile
    const success = await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: `${countryCode}${formData.phone}`,
      company: companyData,
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

  const subTabs = [
    { id: 'account', label: 'Account Details', icon: 'manage_accounts' },
    { id: 'organization', label: 'Organization Information', icon: 'domain' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-sm max-w-3xl">
      {/* Role Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-headline font-bold uppercase tracking-wider mb-2">
        <span className="material-symbols-outlined notranslate text-sm" translate="no">verified_user</span>
        {role.charAt(0).toUpperCase() + role.slice(1)} Profile Setup
      </div>

      {/* Tab Navigation for Business users */}
      {role !== 'individual' && (
        <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto bg-slate-50/50 p-1.5 rounded-xl border">
          {subTabs.map((tab) => {
            const isTabCompleted = tab.id === 'account' 
              ? (formData.firstName && formData.lastName && formData.phone)
              : (formData.companyName && formData.entityType && formData.state && formData.pinCode);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'organization' && !validateAccountTab()) {
                    return; // Don't let them click tab if account details are invalid
                  }
                  setActiveSubTab(tab.id as 'account' | 'organization');
                }}
                className={`flex items-center gap-2 px-5 py-3 font-headline font-bold text-xs uppercase tracking-wider transition-all border-b-2 rounded-lg whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'border-primary text-primary bg-white shadow-sm'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-slate-100/50'
                }`}
              >
                <span className="material-symbols-outlined notranslate text-base" translate="no">
                  {isTabCompleted && activeSubTab !== tab.id ? 'check_circle' : tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Render Account Tab Content */}
      {(activeSubTab === 'account' || role === 'individual') && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
            <span className="material-symbols-outlined notranslate text-amber-600 shrink-0" translate="no">warning</span>
            <div>
              <p className="font-bold">Important Verification Guideline</p>
              <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                Please ensure your name and contact details match exactly with the authorized signatory details on your official GST/PAN documents to prevent verification failure.
              </p>
            </div>
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
              <PhoneInput
                value={formData.phone}
                countryCode={countryCode}
                onValueChange={(val) => {
                  setFormData((prev) => ({ ...prev, phone: val }));
                  setIsPhoneVerified(false);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                onCountryCodeChange={(code) => {
                  setCountryCode(code);
                  setIsPhoneVerified(false);
                }}
                onVerified={() => setIsPhoneVerified(true)}
                error={errors.phone}
                isVerified={isPhoneVerified}
              />
            </div>
          </div>

          {/* Actions */}
          {role !== 'individual' ? (
            <button
              type="button"
              onClick={() => {
                if (validateAccountTab()) {
                  setActiveSubTab('organization');
                }
              }}
              className="w-full py-4 text-white font-headline font-bold rounded-xl transition-all shadow-lg hover:scale-[1.01] hover:shadow-primary/20 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
            >
              <span>Continue to Organization Details</span>
              <span className="material-symbols-outlined notranslate text-sm" translate="no">arrow_forward</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full py-4 text-white font-headline font-bold rounded-xl transition-all shadow-lg hover:scale-[1.01] hover:shadow-primary/20 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
            >
              {loading ? 'Saving Details...' : 'Save & Proceed to Discovery'}
            </button>
          )}
        </div>
      )}

      {/* Render Organization Tab Content */}
      {role !== 'individual' && activeSubTab === 'organization' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
            <span className="material-symbols-outlined notranslate text-amber-600 shrink-0" translate="no">warning</span>
            <div>
              <p className="font-bold">GST Matching Verification Note</p>
              <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                Your Company Name, GST Number, and Registered Office Address details must match exactly with your official GST registration document. Mismatches will cause immediate verification failure.
              </p>
            </div>
          </div>

          {/* Company Name & GSTIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Company Name / Registered Legal Name
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

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                GSTIN / GST Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="27AAAAA1111A1Z1"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold uppercase"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">receipt_long</span>
              </div>
              {errors.gstin && <p className="text-error text-xs mt-1 font-bold">{errors.gstin}</p>}
            </div>
          </div>

          {/* Entity Type & Registration Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Entity / Organization Type
              </label>
              <div className="relative">
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select Entity Type</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Public Limited Company">Public Limited Company</option>
                  <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                  <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                  <option value="Trust / Society / AOP">Trust / Society / AOP</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30 pointer-events-none" translate="no">expand_more</span>
              </div>
              {errors.entityType && <p className="text-error text-xs mt-1 font-bold">{errors.entityType}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Registration Number / CIN (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="U12345MH2026PTC123456"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">gavel</span>
              </div>
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary font-headline">Registered Office Address</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Building No, Street Name, Industrial Area"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
                />
                {errors.addressLine1 && <p className="text-error text-xs mt-1 font-bold">{errors.addressLine1}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Floor, Suite, Landmark"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
                />
                {errors.city && <p className="text-error text-xs mt-1 font-bold">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">State</label>
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {STATE_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30 pointer-events-none" translate="no">expand_more</span>
                </div>
                {errors.state && <p className="text-error text-xs mt-1 font-bold">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                />
                {errors.pinCode && <p className="text-error text-xs mt-1 font-bold">{errors.pinCode}</p>}
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary font-headline">Operational Metrics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Year of Establishment</label>
                <input
                  type="text"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleChange}
                  placeholder="2010"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                />
                {errors.yearEstablished && <p className="text-error text-xs mt-1 font-bold">{errors.yearEstablished}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Total Employees</label>
                <div className="relative">
                  <select
                    name="employeesRange"
                    value={formData.employeesRange}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select Employee Count</option>
                    <option value="1-10">1 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201-500">201 - 500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30 pointer-events-none" translate="no">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Annual Turnover Range</label>
                <div className="relative">
                  <select
                    name="turnoverRange"
                    value={formData.turnoverRange}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select Annual Turnover</option>
                    <option value="Under ₹1 Crore">Under ₹1 Crore</option>
                    <option value="₹1 Crore - ₹5 Crore">₹1 Crore - ₹5 Crore</option>
                    <option value="₹5 Crore - ₹20 Crore">₹5 Crore - ₹20 Crore</option>
                    <option value="₹20 Crore - ₹100 Crore">₹20 Crore - ₹100 Crore</option>
                    <option value="Above ₹100 Crore">Above ₹100 Crore</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30 pointer-events-none" translate="no">expand_more</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Company Website URL (Optional)</label>
              <div className="relative">
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://acmeindustries.com"
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/30" translate="no">language</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setActiveSubTab('account')}
              className="px-6 py-4 border border-primary/20 text-primary hover:bg-primary/5 font-headline font-bold rounded-xl transition-all w-1/3 text-center"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || authLoading}
              className="flex-1 py-4 text-white font-headline font-bold rounded-xl transition-all shadow-lg hover:scale-[1.01] hover:shadow-primary/20 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
            >
              {loading ? 'Saving Details...' : 'Save & Proceed to Discovery'}
            </button>
          </div>
        </div>
      )}
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
