'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, CreateOrganizationData } from '@/lib/org-validation';
import { getOrganizationData, updateOrganization } from '@/lib/services/org-services';
import { useAuth } from '@/lib/auth-context';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { ModernCard } from '@/components/ModernCard';
import DashboardLayout from '@/components/DashboardLayout';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { CameraIcon } from '@heroicons/react/24/outline';

// We omit subscription fields for the edit form since they are managed separately
const editOrgSchema = createOrganizationSchema.omit({ subscriptionPlan: true, billingCycle: true });
type EditOrgData = Omit<CreateOrganizationData, 'subscriptionPlan' | 'billingCycle'>;

export default function EditOrganizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditOrgData>({
    resolver: zodResolver(editOrgSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchOrg = async () => {
      try {
        const orgData = await getOrganizationData(id as string, `organizations/${id}`, user);
        if (orgData) {
          reset({
            name: orgData.name,
            industry: orgData.industry,
            gstin: orgData.gstin,
            website: orgData.website || '',
            address: orgData.address,
            country: orgData.country,
            state: orgData.state,
            timezone: orgData.timezone,
          });
          setLogoUrl(orgData.logo || '');
        }
      } catch (err: any) {
        setError(err.message || 'Access denied');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrg();
  }, [user, id, reset]);

  const onSubmit = async (data: EditOrgData) => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await updateOrganization(id as string, data);
      setSuccess('Organization details updated successfully');
      setTimeout(() => router.push(`/organizations/${id}`), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    setError('');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `organizationLogos/${id}/logo_${Date.now()}.${fileExt}`;
      const imageRef = storageRef(storage, fileName);
      
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      await updateOrganization(id as string, { logo: downloadURL });
      setLogoUrl(downloadURL);
      setSuccess('Logo updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to upload logo. ' + err.message);
    } finally {
      setUploadingLogo(false);
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
    <DashboardLayout title="Dashboard">
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Edit Organization</h1>
                <p className="text-on-surface-variant mt-1">Update company details and branding</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push(`/organizations/${id}`)}>
                Cancel
              </ModernButton>
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-success/10 border border-success/20 text-success rounded-xl font-medium text-sm">
                {success}
              </div>
            )}

            <ModernCard className="p-6 md:p-8">
              {/* Logo Section */}
              <div className="mb-8 flex items-center gap-6 pb-8 border-b border-outline-variant">
                <div className="relative">
                  <div className="h-24 w-24 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant shadow-soft">
                    {uploadingLogo ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
                    ) : (
                      <span className="text-sm font-bold text-on-surface-variant text-center px-2">No Logo</span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary-dark transition-colors">
                    <CameraIcon className="w-4 h-4" />
                    <input type="file" accept="image/jpeg, image/png, image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Company Logo</h3>
                  <p className="text-sm text-on-surface-variant">JPG, PNG or SVG, max 2MB. Recommended 256x256px.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ModernInput label="Organization Name" {...register('name')} error={errors.name?.message} />
                  <ModernInput label="Industry" {...register('industry')} error={errors.industry?.message} />
                  <ModernInput label="GSTIN" {...register('gstin')} error={errors.gstin?.message} />
                  <ModernInput label="Website" {...register('website')} error={errors.website?.message} />
                  
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant pb-2">Location</h3>
                  </div>

                  <div className="md:col-span-2">
                    <ModernInput label="Full Address" {...register('address')} error={errors.address?.message} />
                  </div>
                  <ModernInput label="Country" {...register('country')} error={errors.country?.message} />
                  <ModernInput label="State/Province" {...register('state')} error={errors.state?.message} />
                  <ModernInput label="Timezone" {...register('timezone')} error={errors.timezone?.message} />
                </div>

                <div className="flex justify-end pt-6 border-t border-outline-variant mt-8">
                  <ModernButton type="submit" variant="primary" loading={saving}>
                    Save Changes
                  </ModernButton>
                </div>
              </form>
            </ModernCard>
          </div>
        </div>
      </DashboardLayout>
  );
}
