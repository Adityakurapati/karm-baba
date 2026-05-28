'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { ModernButton } from '@/components/ModernButton';
import { useAuth } from '@/lib/auth-context';
import { getOrganizationData } from '@/lib/services/org-services';
import { Organization, OrganizationAnalytics, OrganizationMember } from '@/lib/types';
import { BuildingOfficeIcon, UsersIcon, ChartBarIcon, CreditCardIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function OrganizationDashboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [org, setOrg] = useState<Organization | null>(null);
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchData = async () => {
      try {
        // Use our tenant helper to ensure isolation
        const orgData = await getOrganizationData(id as string, `organizations/${id}`, user);
        if (!orgData) {
          setError('Organization not found');
          setLoading(false);
          return;
        }
        
        setOrg({
          ...orgData,
          createdAt: new Date(orgData.createdAt),
          updatedAt: new Date(orgData.updatedAt),
          renewalDate: new Date(orgData.renewalDate)
        });

        // Only fetch related data if org is not deleted
        if (orgData.status !== 'Deleted') {
          const analyticsData = await getOrganizationData(id as string, `organizationAnalytics/${id}`, user);
          if (analyticsData) setAnalytics(analyticsData);

          const membersData = await getOrganizationData(id as string, `organizationMembers/${id}`, user);
          if (membersData) {
             setMembers(Object.values(membersData));
          }
        }
      } catch (err: any) {
        setError(err.message || 'Access denied');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-soft max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Access Denied</h2>
          <p className="text-on-surface-variant mb-6">{error || 'You do not have permission to view this organization.'}</p>
          <ModernButton onClick={() => router.push('/dashboard')}>Return Home</ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-outline-variant">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                  ) : (
                    <BuildingOfficeIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-display font-bold text-on-surface">{org.name}</h1>
                    <ModernBadge 
                      variant={org.status === 'Approved' ? 'success' : org.status === 'Pending' ? 'warning' : 'error'}
                    >
                      {org.status}
                    </ModernBadge>
                  </div>
                  <p className="text-on-surface-variant text-sm mt-1">{org.industry} • GSTIN: {org.gstin}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ModernButton variant="outline" onClick={() => router.push(`/organizations/${id}/settings`)}>Settings</ModernButton>
                <ModernButton variant="primary" onClick={() => router.push(`/organizations/${id}/edit`)}>Edit Profile</ModernButton>
              </div>
            </div>

            {/* Warning Banner for Pending */}
            {org.status === 'Pending' && (
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-warning-dark shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-warning-dark">Pending Approval</h3>
                  <p className="text-sm text-warning-dark/80 mt-1">Your organization is currently under review by our team. Some platform features may be restricted until approval is granted.</p>
                </div>
              </div>
            )}

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Subscription Card */}
              <ModernCard className="md:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5 text-primary" />
                      Subscription Overview
                    </h2>
                    <ModernBadge variant={org.paymentStatus === 'Active' ? 'success' : org.paymentStatus === 'Trial' ? 'primary' : 'error'}>
                      {org.paymentStatus}
                    </ModernBadge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Plan</p>
                      <p className="font-bold text-on-surface">{org.subscriptionPlan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Billing</p>
                      <p className="font-bold text-on-surface capitalize">{org.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Renewal</p>
                      <p className="font-bold text-on-surface">{org.renewalDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Usage Bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-on-surface-variant">User Limit</span>
                        <span className="font-bold text-on-surface">{members.length} / {org.userLimit}</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (members.length / org.userLimit) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-on-surface-variant">Storage Limit</span>
                        <span className="font-bold text-on-surface">2.4GB / {org.storageLimit}GB</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: `${Math.min(100, (2.4 / org.storageLimit) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-outline-variant flex justify-end">
                  <ModernButton variant="outline" className="text-sm">Manage Billing</ModernButton>
                </div>
              </ModernCard>

              {/* Quick Stats */}
              <div className="space-y-6">
                <ModernCard className="p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant font-bold">Team Members</p>
                      <h3 className="text-2xl font-bold text-on-surface">{members.length}</h3>
                    </div>
                  </div>
                  <ModernButton variant="ghost" fullWidth className="mt-2 text-sm justify-center" onClick={() => router.push(`/organizations/${id}/members`)}>
                    Manage Team →
                  </ModernButton>
                </ModernCard>

                <ModernCard className="p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <ChartBarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant font-bold">Total CRM Leads</p>
                      <h3 className="text-2xl font-bold text-on-surface">{analytics?.leadsCreated || 0}</h3>
                    </div>
                  </div>
                  <ModernButton variant="ghost" fullWidth className="mt-2 text-sm justify-center" onClick={() => router.push(`/organizations/${id}/analytics`)}>
                    View Analytics →
                  </ModernButton>
                </ModernCard>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
