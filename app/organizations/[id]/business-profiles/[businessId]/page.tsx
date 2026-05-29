'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { getBusinessById } from '@/lib/services/business-services';
import { BusinessProfile } from '@/lib/types';
import { 
  BuildingOfficeIcon, 
  DocumentCheckIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  DocumentDuplicateIcon,
  UserGroupIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function BusinessDashboard() {
  const params = useParams();
  const orgId = params.id as string;
  const businessId = params.businessId as string;
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await getBusinessById(businessId);
        if (data) {
          setBusiness(data);
        } else {
          setError('Business not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching business details');
      } finally {
        setLoading(false);
      }
    };
    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center p-4">
        <ModernCard className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Error</h2>
          <p className="text-on-surface-variant mb-6">{error || 'Something went wrong'}</p>
          <ModernButton onClick={() => router.push('/')}>Go Home</ModernButton>
        </ModernCard>
      </div>
    );
  }

  return (
    <DashboardLayout title="Business Profile">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface flex items-center gap-3">
                  {business.businessName}
                  {business.verificationStatus === 'Verified' && (
                    <ShieldCheckIcon className="w-8 h-8 text-green-500" />
                  )}
                </h1>
                <p className="text-on-surface-variant mt-1">{business.legalName} • {business.industryType}</p>
              </div>
              <div className="flex gap-3">
                <ModernButton 
                  variant="outline" 
                  icon={<DocumentDuplicateIcon className="w-5 h-5" />}
                  onClick={() => router.push(`/organizations/${orgId}/business-profiles/${businessId}/documents`)}
                >
                  Documents
                </ModernButton>
                <ModernButton 
                  variant="primary" 
                  icon={<PencilIcon className="w-5 h-5" />}
                  onClick={() => router.push(`/organizations/${orgId}/business-profiles/${businessId}/edit`)}
                >
                  Edit Profile
                </ModernButton>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Verification Status */}
              <ModernCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface">Status</h3>
                  <DocumentCheckIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Overall</span>
                    <ModernBadge 
                      variant={business.verificationStatus === 'Verified' ? 'success' : business.verificationStatus === 'Pending' ? 'warning' : 'error'}
                    >
                      {business.verificationStatus}
                    </ModernBadge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">GSTIN</span>
                    <ModernBadge variant={business.gstVerificationResponse?.status === 'Verified' ? 'success' : 'warning'}>
                      {business.gstVerificationResponse?.status || 'Pending'}
                    </ModernBadge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">PAN</span>
                    <ModernBadge variant={business.panVerificationResponse?.status === 'Verified' ? 'success' : 'warning'}>
                      {business.panVerificationResponse?.status || 'Pending'}
                    </ModernBadge>
                  </div>
                </div>
              </ModernCard>

              {/* Risk Score */}
              <ModernCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface">Risk Score</h3>
                  <ShieldCheckIcon className="w-6 h-6 text-warning" />
                </div>
                <div className="flex flex-col items-center justify-center h-24">
                  <span className={`text-4xl font-black ${
                    business.riskScore > 75 ? 'text-error' : 
                    business.riskScore > 40 ? 'text-warning' : 'text-success'
                  }`}>
                    {business.riskScore}
                  </span>
                  <span className="text-sm text-on-surface-variant mt-1">out of 100</span>
                </div>
              </ModernCard>

              {/* Credibility Score */}
              <ModernCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface">Credibility</h3>
                  <ChartBarIcon className="w-6 h-6 text-success" />
                </div>
                <div className="flex flex-col items-center justify-center h-24">
                  <span className={`text-4xl font-black ${
                    business.credibilityScore > 80 ? 'text-success' : 
                    business.credibilityScore > 50 ? 'text-primary' : 'text-warning'
                  }`}>
                    {business.credibilityScore}
                  </span>
                  <span className="text-sm text-on-surface-variant mt-1">Platform Rating</span>
                </div>
              </ModernCard>

              {/* CRM / Leads summary */}
              <ModernCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-on-surface">Active Leads</h3>
                  <UserGroupIcon className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex flex-col items-center justify-center h-24">
                  <span className="text-4xl font-black text-on-surface">12</span>
                  <span className="text-sm text-on-surface-variant mt-1">Matched deals</span>
                </div>
              </ModernCard>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Company Info */}
              <div className="lg:col-span-2 space-y-6">
                <ModernCard className="p-6">
                  <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Registration (GSTIN)</p>
                      <p className="font-medium text-on-surface">{business.gstin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">PAN Number</p>
                      <p className="font-medium text-on-surface">{business.pan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Category</p>
                      <p className="font-medium text-on-surface">{business.businessCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Year Established</p>
                      <p className="font-medium text-on-surface">{business.yearEstablished}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Company Size</p>
                      <p className="font-medium text-on-surface">{business.companySize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Revenue Range</p>
                      <p className="font-medium text-on-surface">{business.annualRevenueRange}</p>
                    </div>
                  </div>
                </ModernCard>

                <ModernCard className="p-6">
                  <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-primary" />
                    Contact & Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="md:col-span-2">
                      <p className="text-sm text-on-surface-variant mb-1">Headquarters</p>
                      <p className="font-medium text-on-surface">{business.headquartersAddress}</p>
                      <p className="font-medium text-on-surface">{business.state}, {business.country} - {business.pincode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Contact Person</p>
                      <p className="font-medium text-on-surface">{business.contactInformation.contactPersonName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Contact Email</p>
                      <p className="font-medium text-on-surface">{business.contactInformation.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Contact Mobile</p>
                      <p className="font-medium text-on-surface">{business.contactInformation.contactMobileNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-variant mb-1">Website</p>
                      <a href={business.websiteUrl || '#'} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        {business.websiteUrl || 'N/A'}
                      </a>
                    </div>
                  </div>
                </ModernCard>
              </div>

              {/* Sidebar content */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <ModernCard className="p-6">
                  <h3 className="font-bold text-on-surface mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <ModernButton fullWidth variant="outline" onClick={() => router.push(`/organizations/${orgId}/business-profiles/${businessId}/documents`)}>
                      Manage Documents
                    </ModernButton>
                    <ModernButton fullWidth variant="outline" onClick={() => router.push(`/organizations/${orgId}/business-profiles/${businessId}/history`)}>
                      View Audit History
                    </ModernButton>
                  </div>
                </ModernCard>
              </div>

            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
