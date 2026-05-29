'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { useAuth } from '@/lib/auth-context';
import { Organization } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ModernButton } from '@/components/ModernButton';
import { approveOrganization, rejectOrganization } from '@/lib/services/org-services';

export default function AdminPendingApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingOrgs, setPendingOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const orgsRef = ref(database, 'organizations');
    const unsubscribe = onValue(orgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingList = Object.keys(data)
          .map(key => ({
            ...data[key],
            id: key,
            createdAt: new Date(data[key].createdAt),
          }))
          .filter(org => org.status === 'Pending') as Organization[];
        
        setPendingOrgs(pendingList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
      } else {
        setPendingOrgs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (orgId: string) => {
    if (!user) return;
    const remarks = prompt('Enter approval remarks (optional):') || 'Approved';
    setProcessingId(orgId);
    try {
      await approveOrganization(orgId, user.id, remarks);
    } catch (e) {
      console.error(e);
      alert('Failed to approve organization.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orgId: string) => {
    if (!user) return;
    const remarks = prompt('Enter reason for rejection (required):');
    if (!remarks) {
      alert('Rejection reason is required.');
      return;
    }
    setProcessingId(orgId);
    try {
      await rejectOrganization(orgId, user.id, remarks);
    } catch (e) {
      console.error(e);
      alert('Failed to reject organization.');
    } finally {
      setProcessingId(null);
    }
  };

  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Pending Approvals</h1>
                <p className="text-on-surface-variant mt-1">Review and approve new organizations</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push('/admin/organizations')}>
                Back to All Organizations
              </ModernButton>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : pendingOrgs.length === 0 ? (
              <ModernCard className="p-12 text-center">
                <DocumentCheckIcon className="w-16 h-16 mx-auto text-success/50 mb-4" />
                <h2 className="text-xl font-bold text-on-surface mb-2">All Caught Up!</h2>
                <p className="text-on-surface-variant">There are no pending organizations waiting for approval.</p>
              </ModernCard>
            ) : (
              <div className="space-y-6">
                {pendingOrgs.map(org => (
                  <ModernCard key={org.id} className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      
                      {/* Org Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <BuildingOfficeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-on-surface">{org.name}</h2>
                            <p className="text-sm text-on-surface-variant">{org.industry} • Registered {org.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-surface-container-low p-4 rounded-xl">
                          <div>
                            <p className="text-on-surface-variant font-medium">GSTIN</p>
                            <p className="font-bold text-on-surface font-mono">{org.gstin}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant font-medium">Location</p>
                            <p className="font-bold text-on-surface">{org.state}, {org.country}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant font-medium">Website</p>
                            <p className="font-bold text-on-surface">{org.website || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant font-medium">Selected Plan</p>
                            <p className="font-bold text-primary">{org.subscriptionPlan} ({org.billingCycle})</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col justify-end lg:justify-center gap-3 lg:border-l lg:border-outline-variant lg:pl-6 min-w-[200px]">
                        <ModernButton 
                          variant="success" 
                          fullWidth 
                          className="flex items-center justify-center gap-2"
                          loading={processingId === org.id}
                          disabled={processingId !== null && processingId !== org.id}
                          onClick={() => handleApprove(org.id)}
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          Approve
                        </ModernButton>
                        <ModernButton 
                          variant="outline" 
                          fullWidth 
                          className="flex items-center justify-center gap-2 border-error text-error hover:bg-error/10"
                          loading={processingId === org.id}
                          disabled={processingId !== null && processingId !== org.id}
                          onClick={() => handleReject(org.id)}
                        >
                          <XCircleIcon className="w-5 h-5" />
                          Reject
                        </ModernButton>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
  );
}
