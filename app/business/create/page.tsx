'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';
import { ModernCard } from '@/components/ModernCard';
import TopNavbar from '@/components/TopNavbar';
import { useAuth } from '@/lib/auth-context';
import { createBusiness } from '@/lib/services/business-services';
import { 
  basicInfoSchema, 
  registrationInfoSchema, 
  contactInfoSchema, 
  companyInfoSchema,
  BasicInfoData,
  RegistrationInfoData,
  ContactInfoData,
  CompanyInfoData
} from '@/lib/business-validation';

const STEPS = [
  { id: 1, title: 'Basic Information', schema: basicInfoSchema },
  { id: 2, title: 'Registration', schema: registrationInfoSchema },
  { id: 3, title: 'Contact', schema: contactInfoSchema },
  { id: 4, title: 'Company', schema: companyInfoSchema },
];

export default function CreateBusinessProfile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const methods = useForm({
    mode: 'onTouched',
    resolver: zodResolver(STEPS[currentStep - 1].schema),
    defaultValues: {
      businessName: '',
      legalName: '',
      industryType: '',
      businessCategory: '',
      yearEstablished: new Date().getFullYear(),
      gstin: '',
      pan: '',
      cin: '',
      websiteUrl: '',
      linkedinUrl: '',
      headquartersAddress: '',
      state: '',
      country: '',
      pincode: '',
      contactPersonName: '',
      contactEmail: '',
      contactMobileNumber: '',
      companySize: '',
      annualRevenueRange: ''
    }
  });

  const { handleSubmit, trigger, getValues, reset, formState: { errors: rawErrors } } = methods;
  const errors: any = rawErrors;

  // Load Draft
  useEffect(() => {
    const draft = localStorage.getItem('businessProfileDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        reset(parsed);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [reset]);

  // Save Draft
  useEffect(() => {
    const subscription = methods.watch((value) => {
      localStorage.setItem('businessProfileDraft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  const handleNext = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: any) => {
    if (currentStep !== STEPS.length) {
      handleNext();
      return;
    }

    if (!user) {
      setError("You must be logged in to create a business profile.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const businessId = await createBusiness({
        organizationId: user.company?.id || `ORG-${Date.now()}`,
        businessName: data.businessName,
        legalName: data.legalName,
        gstin: data.gstin,
        pan: data.pan,
        cin: data.cin,
        industryType: data.industryType,
        businessCategory: data.businessCategory,
        companySize: data.companySize,
        annualRevenueRange: data.annualRevenueRange,
        yearEstablished: data.yearEstablished,
        websiteUrl: data.websiteUrl,
        linkedinUrl: data.linkedinUrl,
        headquartersAddress: data.headquartersAddress,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        contactInformation: {
          contactPersonName: data.contactPersonName,
          contactEmail: data.contactEmail,
          contactMobileNumber: data.contactMobileNumber
        },
        status: 'active',
        verificationStatus: 'Pending',
        riskScore: 50,
        credibilityScore: 50,
        createdBy: user.id,
      });

      localStorage.removeItem('businessProfileDraft');
      router.push(`/business/${businessId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create business profile");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container pb-12">
      <TopNavbar />
      <div className="max-w-3xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-on-surface">Create Business Profile</h1>
          <p className="text-on-surface-variant mt-2">Complete your profile to unlock premium features and start trading.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface-container-high -translate-y-1/2 rounded-full z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  currentStep >= step.id ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {step.id}
                </div>
                <span className="text-xs mt-2 font-medium text-on-surface-variant hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <ModernCard className="p-6 md:p-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-5">
                  <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Basic Information</h2>
                  <ModernInput 
                    label="Business Name" 
                    placeholder="Enter business name"
                    {...methods.register('businessName')}
                    error={errors.businessName?.message as string}
                  />
                  <ModernInput 
                    label="Legal Entity Name" 
                    placeholder="e.g. KARM BABA PRIVATE LIMITED"
                    {...methods.register('legalName')}
                    error={errors.legalName?.message as string}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Industry Type</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        {...methods.register('industryType')}
                      >
                        <option value="">Select Industry</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="IT Services">IT Services</option>
                        <option value="Trading">Trading</option>
                        <option value="Healthcare">Healthcare</option>
                      </select>
                      {errors.industryType && <p className="text-xs text-error mt-2 font-medium">{errors.industryType.message as string}</p>}
                    </div>
                    <ModernInput 
                      label="Business Category" 
                      placeholder="e.g. Electronics, Textiles"
                      {...methods.register('businessCategory')}
                      error={errors.businessCategory?.message as string}
                    />
                  </div>
                  <ModernInput 
                    label="Year Established" 
                    type="number"
                    {...methods.register('yearEstablished')}
                    error={errors.yearEstablished?.message as string}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fade-in space-y-5">
                  <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Registration Information</h2>
                  <ModernInput 
                    label="GSTIN" 
                    placeholder="15-character GSTIN"
                    {...methods.register('gstin')}
                    error={errors.gstin?.message as string}
                  />
                  <ModernInput 
                    label="PAN Number" 
                    placeholder="10-character PAN"
                    {...methods.register('pan')}
                    error={errors.pan?.message as string}
                  />
                  <ModernInput 
                    label="CIN Number (Optional)" 
                    placeholder="21-character CIN"
                    {...methods.register('cin')}
                    error={errors.cin?.message as string}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fade-in space-y-5">
                  <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ModernInput 
                      label="Website URL (Optional)" 
                      type="url"
                      placeholder="https://"
                      {...methods.register('websiteUrl')}
                      error={errors.websiteUrl?.message as string}
                    />
                    <ModernInput 
                      label="LinkedIn URL (Optional)" 
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      {...methods.register('linkedinUrl')}
                      error={errors.linkedinUrl?.message as string}
                    />
                  </div>
                  <ModernInput 
                    label="Headquarters Address" 
                    {...methods.register('headquartersAddress')}
                    error={errors.headquartersAddress?.message as string}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ModernInput 
                      label="State" 
                      {...methods.register('state')}
                      error={errors.state?.message as string}
                    />
                    <ModernInput 
                      label="Country" 
                      {...methods.register('country')}
                      error={errors.country?.message as string}
                    />
                    <ModernInput 
                      label="Pincode" 
                      {...methods.register('pincode')}
                      error={errors.pincode?.message as string}
                    />
                  </div>
                  <h3 className="font-bold text-on-surface mt-6 pt-4 border-t">Primary Contact Person</h3>
                  <ModernInput 
                    label="Contact Person Name" 
                    {...methods.register('contactPersonName')}
                    error={errors.contactPersonName?.message as string}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ModernInput 
                      label="Contact Email" 
                      type="email"
                      {...methods.register('contactEmail')}
                      error={errors.contactEmail?.message as string}
                    />
                    <ModernInput 
                      label="Contact Mobile" 
                      {...methods.register('contactMobileNumber')}
                      error={errors.contactMobileNumber?.message as string}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="animate-fade-in space-y-5">
                  <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Company Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Company Size</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        {...methods.register('companySize')}
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="201-500">201-500 Employees</option>
                        <option value="500+">500+ Employees</option>
                      </select>
                      {errors.companySize && <p className="text-xs text-error mt-2 font-medium">{errors.companySize.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Annual Revenue Range</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        {...methods.register('annualRevenueRange')}
                      >
                        <option value="">Select Revenue Range</option>
                        <option value="< 1Cr">Less than 1 Cr</option>
                        <option value="1Cr - 10Cr">1 Cr - 10 Cr</option>
                        <option value="10Cr - 50Cr">10 Cr - 50 Cr</option>
                        <option value="50Cr - 100Cr">50 Cr - 100 Cr</option>
                        <option value="100Cr+">100 Cr+</option>
                      </select>
                      {errors.annualRevenueRange && <p className="text-xs text-error mt-2 font-medium">{errors.annualRevenueRange.message as string}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t mt-8">
                <ModernButton 
                  type="button" 
                  variant="ghost" 
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  Back
                </ModernButton>
                
                <ModernButton 
                  type="button" 
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                >
                  {currentStep === STEPS.length ? 'Create Profile' : 'Next Step'}
                </ModernButton>
              </div>
            </form>
          </FormProvider>
        </ModernCard>
      </div>
    </div>
  );
}
