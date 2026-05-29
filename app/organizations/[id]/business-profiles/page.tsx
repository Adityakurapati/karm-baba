'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernButton } from '@/components/ModernButton';
import { useAuth } from '@/lib/auth-context';
import { getBusinessesByOrganization } from '@/lib/services/business-services';
import { BusinessProfile } from '@/lib/types';
import { BuildingStorefrontIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BusinessProfilesList() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orgId = params.id as string;

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const data = await getBusinessesByOrganization(orgId);
        setBusinesses(data);
      } catch (err) {
        console.error('Failed to load business profiles', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [orgId]);

  return (
    <DashboardLayout title="Business Profiles">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-primary" />
              Business Profiles
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">Manage the business entities under your organization.</p>
          </div>
          {user?.role !== 'analyst' && (
            <ModernButton
              onClick={() => router.push(`/organizations/${orgId}/business-profiles/create`)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Business Profile
            </ModernButton>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-surface-container-high rounded-xl"></div>
            <div className="h-24 bg-surface-container-high rounded-xl"></div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingStorefrontIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">No Business Profiles Found</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-6 text-sm">
              Your organization doesn't have any business profiles yet. Create one to start managing products and deals.
            </p>
            {user?.role !== 'analyst' && (
              <ModernButton onClick={() => router.push(`/organizations/${orgId}/business-profiles/create`)}>
                Create First Profile
              </ModernButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/organizations/${orgId}/business-profiles/${business.id}`)}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xl">
                    {business.businessName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">{business.businessName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${business.verificationStatus === 'Verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {business.verificationStatus}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-on-surface-variant">
                  <p><span className="font-medium text-on-surface">Category:</span> {business.businessCategory}</p>
                  <p><span className="font-medium text-on-surface">GSTIN:</span> {business.gstin}</p>
                  <p><span className="font-medium text-on-surface">Country:</span> {business.country}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center text-primary text-sm font-medium">
                  Manage Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
