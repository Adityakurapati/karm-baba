'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { useAuth } from '@/lib/auth-context';
import { getOrganizationData, updateOrganizationSettings } from '@/lib/services/org-services';
import { OrganizationSettings } from '@/lib/types';
import { updateOrganizationSettingsSchema, UpdateOrganizationSettingsData } from '@/lib/org-validation';

export default function OrganizationSettingsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateOrganizationSettingsData>({
    resolver: zodResolver(updateOrganizationSettingsSchema),
    mode: 'onTouched'
  });

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchSettings = async () => {
      try {
        const settings = await getOrganizationData(id as string, `organizationSettings/${id}`, user);
        if (settings) {
          reset({
            theme: settings.theme,
            notificationSettings: settings.notificationSettings,
            emailSettings: {
              senderName: settings.emailSettings.senderName,
              senderEmail: settings.emailSettings.senderEmail
            }
          });
        }
      } catch (err: any) {
        setError(err.message || 'Access denied');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user, id, reset]);

  const onSubmit = async (data: UpdateOrganizationSettingsData) => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, you would also validate if the current user has `organization_admin` role for this org
      await updateOrganizationSettings(id as string, data as any);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
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
                <h1 className="text-3xl font-display font-bold text-on-surface">Organization Settings</h1>
                <p className="text-on-surface-variant mt-1">Configure your workspace</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push(`/organizations/${id}`)}>
                Back to Dashboard
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <ModernCard className="p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">Branding & Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Theme</label>
                    <select {...register('theme')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  {/* Logo upload would go here */}
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">Email Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Sender Name</label>
                    <input {...register('emailSettings.senderName')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none" />
                    {errors.emailSettings?.senderName && <p className="text-xs text-error mt-1">{errors.emailSettings.senderName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">Sender Email</label>
                    <input type="email" {...register('emailSettings.senderEmail')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none" />
                    {errors.emailSettings?.senderEmail && <p className="text-xs text-error mt-1">{errors.emailSettings.senderEmail.message}</p>}
                  </div>
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('notificationSettings.emailNotifications')} className="w-5 h-5 rounded text-primary focus:ring-primary/40" />
                    <span className="text-on-surface font-medium text-sm">Enable Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('notificationSettings.smsNotifications')} className="w-5 h-5 rounded text-primary focus:ring-primary/40" />
                    <span className="text-on-surface font-medium text-sm">Enable SMS Notifications (Premium)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('notificationSettings.systemAlerts')} className="w-5 h-5 rounded text-primary focus:ring-primary/40" />
                    <span className="text-on-surface font-medium text-sm">Enable System Alerts</span>
                  </label>
                </div>
              </ModernCard>

              <div className="flex justify-end">
                <ModernButton type="submit" variant="primary" loading={saving}>
                  Save Settings
                </ModernButton>
              </div>

            </form>

          </div>
        </div>
      </DashboardLayout>
  );
}
