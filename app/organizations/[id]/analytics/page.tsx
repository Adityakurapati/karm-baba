'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { useAuth } from '@/lib/auth-context';
import { getOrganizationData } from '@/lib/services/org-services';
import { OrganizationAnalytics } from '@/lib/types';
import { ModernButton } from '@/components/ModernButton';
import { ChartBarIcon, UsersIcon, ShieldCheckIcon, DocumentTextIcon, SparklesIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

export default function OrganizationAnalyticsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchAnalytics = async () => {
      try {
        const data = await getOrganizationData(id as string, `organizationAnalytics/${id}`, user);
        if (data) {
          setAnalytics({
            ...data,
            updatedAt: new Date(data.updatedAt)
          });
        } else {
          // Defaults if not created yet
          setAnalytics({
            id: id as string,
            totalUsers: 0,
            activeUsers: 0,
            vendorsAdded: 0,
            leadsCreated: 0,
            aiReportsGenerated: 0,
            pricingRecordsUploaded: 0,
            updatedAt: new Date()
          });
        }
      } catch (err: any) {
        setError(err.message || 'Access denied');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, id]);

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
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface flex items-center gap-3">
                  <ChartBarIcon className="w-8 h-8 text-primary" />
                  Workspace Analytics
                </h1>
                <p className="text-on-surface-variant mt-1">Key metrics and usage statistics</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <ModernCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UsersIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Total Users</h3>
                    <p className="text-3xl font-bold text-on-surface">{analytics?.totalUsers || 0}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  <span className="font-bold text-success">{analytics?.activeUsers || 0}</span> currently active
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Vendors Added</h3>
                    <p className="text-3xl font-bold text-on-surface">{analytics?.vendorsAdded || 0}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  Across all procurement categories
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <PresentationChartLineIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Leads Created</h3>
                    <p className="text-3xl font-bold text-on-surface">{analytics?.leadsCreated || 0}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  In the CRM pipeline
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning-dark">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">AI Reports</h3>
                    <p className="text-3xl font-bold text-on-surface">{analytics?.aiReportsGenerated || 0}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  Generated by KARM BABA AI
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Pricing Records</h3>
                    <p className="text-3xl font-bold text-on-surface">{analytics?.pricingRecordsUploaded || 0}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant">
                  Uploaded to price intelligence
                </div>
              </ModernCard>

            </div>

            <ModernCard className="p-6 mt-8">
              <h3 className="text-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-2">Usage Trends</h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto text-on-surface-variant opacity-50 mb-2" />
                  <p className="text-on-surface-variant font-medium">Chart visualization will appear here once enough data is collected.</p>
                </div>
              </div>
            </ModernCard>
            
          </div>
        </div>
      </DashboardLayout>
  );
}
