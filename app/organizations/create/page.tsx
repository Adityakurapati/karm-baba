'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, CreateOrganizationData } from '@/lib/org-validation';
import { createOrganization } from '@/lib/services/org-services';
import { useAuth } from '@/lib/auth-context';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { BuildingOfficeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema),
    mode: 'onTouched',
    defaultValues: {
      subscriptionPlan: 'Starter',
      billingCycle: 'monthly'
    }
  });

  const onSubmit = async (data: CreateOrganizationData) => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    try {
      const orgId = await createOrganization({
        ...data,
        paymentStatus: 'Trial',
        userLimit: data.subscriptionPlan === 'Starter' ? 5 : data.subscriptionPlan === 'Professional' ? 50 : 1000,
        storageLimit: data.subscriptionPlan === 'Starter' ? 10 : data.subscriptionPlan === 'Professional' ? 100 : 1000,
        apiLimit: data.subscriptionPlan === 'Starter' ? 1000 : data.subscriptionPlan === 'Professional' ? 10000 : 100000,
        renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
        createdBy: user.id
      }, user.id);
      
      // Update the user's context directly if needed, though they need to re-fetch or login
      await updateUserProfile({ organizationId: orgId });
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/organizations/${orgId}`);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-soft">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Organization Registered!</h2>
          <p className="text-on-surface-variant mb-6">Your organization is currently pending approval by an administrator. You will be redirected to your dashboard shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-3xl shadow-soft">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="KARM BABA" width={60} height={60} unoptimized />
          </Link>
          <h2 className="text-3xl font-black text-on-surface flex items-center justify-center gap-3">
            <BuildingStorefrontIcon className="w-8 h-8 text-primary" />
            Create Organization
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm">Register your company workspace on KARM BABA</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant pb-2">Company Details</h3>
            </div>
            
            <ModernInput label="Organization Name" {...register('name')} error={errors.name?.message} />
            <ModernInput label="Industry" {...register('industry')} error={errors.industry?.message} />
            <ModernInput label="GSTIN" {...register('gstin')} error={errors.gstin?.message} placeholder="e.g. 22AAAAA0000A1Z5" />
            <ModernInput label="Website (Optional)" {...register('website')} error={errors.website?.message} />
            
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant pb-2">Location</h3>
            </div>

            <div className="md:col-span-2">
              <ModernInput label="Full Address" {...register('address')} error={errors.address?.message} />
            </div>
            <ModernInput label="Country" {...register('country')} error={errors.country?.message} />
            <ModernInput label="State/Province" {...register('state')} error={errors.state?.message} />
            <ModernInput label="Timezone" {...register('timezone')} error={errors.timezone?.message} placeholder="e.g. Asia/Kolkata" />

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant pb-2">Subscription</h3>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-on-surface mb-2">Plan</label>
              <select {...register('subscriptionPlan')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                <option value="Starter">Starter (5 Users)</option>
                <option value="Professional">Professional (50 Users)</option>
                <option value="Enterprise">Enterprise (Unlimited)</option>
              </select>
              {errors.subscriptionPlan && <p className="text-xs text-error mt-1">{errors.subscriptionPlan.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-on-surface mb-2">Billing Cycle</label>
              <select {...register('billingCycle')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly (Save 20%)</option>
              </select>
              {errors.billingCycle && <p className="text-xs text-error mt-1">{errors.billingCycle.message}</p>}
            </div>
          </div>

          <div className="pt-6">
            <ModernButton type="submit" variant="primary" fullWidth loading={loading}>
              Create Organization & Start Trial
            </ModernButton>
            <p className="text-xs text-center text-on-surface-variant mt-4">
              By creating an organization, you agree to the Master Service Agreement and Terms of Service.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
