'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';
import { useAuth } from '@/lib/auth-context';
import { getBusinessById, updateBusiness } from '@/lib/services/business-services';
import { BusinessProfile } from '@/lib/types';
import { businessProfileSchema } from '@/lib/business-validation';

export default function EditBusinessProfile() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const methods = useForm({
    resolver: zodResolver(businessProfileSchema),
    mode: 'onTouched',
  });

  const { handleSubmit, reset, formState: { errors: rawErrors } } = methods;
  const errors: any = rawErrors;

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await getBusinessById(id);
        if (data) {
          setBusiness(data);
          reset(data); // Pre-fill form
        } else {
          setError('Business not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching business details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBusiness();
    }
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    setError('');

    try {
      const updates: Partial<BusinessProfile> = { ...data };
      
      // Check if GSTIN or PAN changed to trigger reverification
      if (business && (data.gstin !== business.gstin || data.pan !== business.pan)) {
        updates.verificationStatus = 'Pending';
        // In a real app, you would also clear gstVerificationResponse and panVerificationResponse
        updates.gstVerificationResponse = null;
        updates.panVerificationResponse = null;
      }

      await updateBusiness(id, updates, user.firstName + ' ' + user.lastName);
      router.push(`/business/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update business profile");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Edit Profile</h1>
                <p className="text-on-surface-variant mt-1">Update your business information</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push(`/business/${id}`)}>
                Cancel
              </ModernButton>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <ModernCard className="p-6 md:p-8">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Basic Info */}
                  <section>
                    <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ModernInput label="Business Name" {...methods.register('businessName')} error={errors.businessName?.message as string} />
                      <ModernInput label="Legal Entity Name" {...methods.register('legalName')} error={errors.legalName?.message as string} />
                      <div>
                        <label className="block text-sm font-bold text-on-surface mb-2">Industry Type</label>
                        <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none" {...methods.register('industryType')}>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="IT Services">IT Services</option>
                          <option value="Trading">Trading</option>
                          <option value="Healthcare">Healthcare</option>
                        </select>
                      </div>
                      <ModernInput label="Business Category" {...methods.register('businessCategory')} error={errors.businessCategory?.message as string} />
                      <ModernInput label="Year Established" type="number" {...methods.register('yearEstablished')} error={errors.yearEstablished?.message as string} />
                    </div>
                  </section>

                  {/* Registration Info */}
                  <section>
                    <div className="flex justify-between items-baseline border-b pb-2 mb-4">
                      <h2 className="text-xl font-bold text-on-surface">Registration Information</h2>
                      <span className="text-xs text-warning font-medium bg-warning/10 px-2 py-1 rounded">Changing these will trigger re-verification</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ModernInput label="GSTIN" {...methods.register('gstin')} error={errors.gstin?.message as string} />
                      <ModernInput label="PAN Number" {...methods.register('pan')} error={errors.pan?.message as string} />
                      <ModernInput label="CIN Number (Optional)" {...methods.register('cin')} error={errors.cin?.message as string} />
                    </div>
                  </section>

                  {/* Contact Info */}
                  <section>
                    <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Contact & Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <ModernInput label="Headquarters Address" {...methods.register('headquartersAddress')} error={errors.headquartersAddress?.message as string} />
                      </div>
                      <ModernInput label="State" {...methods.register('state')} error={errors.state?.message as string} />
                      <ModernInput label="Country" {...methods.register('country')} error={errors.country?.message as string} />
                      <ModernInput label="Pincode" {...methods.register('pincode')} error={errors.pincode?.message as string} />
                      <ModernInput label="Contact Person Name" {...methods.register('contactPersonName')} error={errors.contactPersonName?.message as string} />
                      <ModernInput label="Contact Email" type="email" {...methods.register('contactEmail')} error={errors.contactEmail?.message as string} />
                      <ModernInput label="Contact Mobile" {...methods.register('contactMobileNumber')} error={errors.contactMobileNumber?.message as string} />
                      <ModernInput label="Website URL" type="url" {...methods.register('websiteUrl')} error={errors.websiteUrl?.message as string} />
                    </div>
                  </section>

                  {/* Company Info */}
                  <section>
                    <h2 className="text-xl font-bold text-on-surface mb-4 border-b pb-2">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-on-surface mb-2">Company Size</label>
                        <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none" {...methods.register('companySize')}>
                          <option value="1-10">1-10 Employees</option>
                          <option value="11-50">11-50 Employees</option>
                          <option value="51-200">51-200 Employees</option>
                          <option value="201-500">201-500 Employees</option>
                          <option value="500+">500+ Employees</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface mb-2">Annual Revenue Range</label>
                        <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none" {...methods.register('annualRevenueRange')}>
                          <option value="< 1Cr">Less than 1 Cr</option>
                          <option value="1Cr - 10Cr">1 Cr - 10 Cr</option>
                          <option value="10Cr - 50Cr">10 Cr - 50 Cr</option>
                          <option value="50Cr - 100Cr">50 Cr - 100 Cr</option>
                          <option value="100Cr+">100 Cr+</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-end pt-6 border-t">
                    <ModernButton type="submit" variant="primary" loading={isSubmitting}>
                      Save Changes
                    </ModernButton>
                  </div>
                </form>
              </FormProvider>
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
