'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { Organization } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { BuildingOfficeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ModernButton } from '@/components/ModernButton';
import { approveOrganization, rejectOrganization } from '@/lib/services/org-services';

export default function AdminOrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    // Note: In a real app with strict rules, only super_admin can read the entire 'organizations' node.
    const orgsRef = ref(database, 'organizations');
    const unsubscribe = onValue(orgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orgsList = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          createdAt: new Date(data[key].createdAt),
          updatedAt: new Date(data[key].updatedAt),
          renewalDate: new Date(data[key].renewalDate)
        })) as Organization[];
        
        setOrganizations(orgsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } else {
        setOrganizations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch members when an org is expanded
  useEffect(() => {
    if (!expandedOrgId) {
      setOrgMembers([]);
      return;
    }
    
    setLoadingMembers(true);
    const membersRef = ref(database, `organizationMembers/${expandedOrgId}`);
    const unsubscribeMembers = onValue(membersRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const membersList = Object.keys(data).map(key => ({
          ...data[key],
          joinedAt: new Date(data[key].joinedAt),
        }));
        setOrgMembers(membersList);
      } else {
        setOrgMembers([]);
      }
      setLoadingMembers(false);
    });

    return () => unsubscribeMembers();
  }, [expandedOrgId]);

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

  const filteredOrgs = organizations.filter(org => {
    const matchesFilter = filter === 'All' || org.status === filter;
    const matchesSearch = 
      org.name.toLowerCase().includes(search.toLowerCase()) || 
      org.gstin.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-soft max-w-md">
          <BuildingStorefrontIcon className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Access Denied</h2>
          <p className="text-on-surface-variant mb-6">Only Platform Administrators can view all organizations.</p>
          <ModernButton onClick={() => router.push('/dashboard')}>Return Home</ModernButton>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Organizations Management</h1>
                <p className="text-on-surface-variant mt-1">Manage platform workspaces, approvals, and subscriptions</p>
              </div>
            </div>

            <ModernCard className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-outline-variant pb-6">
                <input 
                  type="text" 
                  placeholder="Search by name or GSTIN..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-80 bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  {['All', 'Pending', 'Approved', 'Suspended', 'Rejected'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                        filter === f 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant text-sm text-on-surface-variant uppercase tracking-wider">
                        <th className="pb-3 font-bold px-2">Organization</th>
                        <th className="pb-3 font-bold px-2">Plan & Limits</th>
                        <th className="pb-3 font-bold px-2">Status</th>
                        <th className="pb-3 font-bold px-2">Created</th>
                        <th className="pb-3 font-bold text-right px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredOrgs.map((org) => (
                        <React.Fragment key={org.id}>
                          <tr className="hover:bg-surface-container-low transition-colors group">
                            <td className="py-4 px-2 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-outline-variant flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer" onClick={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}>
                                {org.logo ? <img src={org.logo} alt="" className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                              </div>
                              <div className="cursor-pointer" onClick={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}>
                                <p className="font-bold text-on-surface truncate max-w-[200px]" title={org.name}>{org.name}</p>
                                <p className="text-xs text-on-surface-variant truncate max-w-[200px]" title={org.gstin}>GSTIN: {org.gstin}</p>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <p className="font-bold text-sm text-on-surface">{org.subscriptionPlan}</p>
                              <p className="text-xs text-on-surface-variant">{org.userLimit} Users | {org.storageLimit}GB</p>
                            </td>
                            <td className="py-4 px-2">
                              <ModernBadge 
                                variant={
                                  org.status === 'Approved' ? 'success' : 
                                  org.status === 'Suspended' || org.status === 'Rejected' ? 'error' : 
                                  'warning'
                                }
                              >
                                {org.status}
                              </ModernBadge>
                            </td>
                            <td className="py-4 px-2 text-sm text-on-surface-variant">
                              {org.createdAt.toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {org.status === 'Pending' && (
                                  <>
                                    <ModernButton 
                                      variant="success" 
                                      className="text-xs py-1.5 px-3" 
                                      loading={processingId === org.id}
                                      onClick={() => handleApprove(org.id)}
                                    >
                                      Approve
                                    </ModernButton>
                                    <ModernButton 
                                      variant="outline" 
                                      className="text-xs py-1.5 px-3 border-error text-error hover:bg-error/10" 
                                      disabled={processingId === org.id}
                                      onClick={() => handleReject(org.id)}
                                    >
                                      Reject
                                    </ModernButton>
                                  </>
                                )}
                                <button 
                                  className="p-1.5 text-on-surface-variant hover:text-primary transition-colors"
                                  onClick={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}
                                  title="View Details"
                                >
                                  <span className="material-symbols-outlined text-xl transition-transform duration-300" style={{ transform: expandedOrgId === org.id ? 'rotate(180deg)' : 'none' }}>
                                    expand_more
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {expandedOrgId === org.id && (
                            <tr className="bg-surface-container-lowest border-b border-outline-variant animate-fade-in">
                              <td colSpan={5} className="p-0">
                                <div className="p-6 border-l-4 border-primary">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Company Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-on-surface-variant">Industry:</span> <span className="font-medium">{org.industry}</span></p>
                                        <p><span className="text-on-surface-variant">Phone:</span> <span className="font-medium">{org.phoneNumber || 'N/A'}</span></p>
                                        <p><span className="text-on-surface-variant">Website:</span> <span className="font-medium">{org.website || 'N/A'}</span></p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Location</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-on-surface-variant">Address:</span> <span className="font-medium">{org.address}</span></p>
                                        <p><span className="text-on-surface-variant">State:</span> <span className="font-medium">{org.state}</span></p>
                                        <p><span className="text-on-surface-variant">Country:</span> <span className="font-medium">{org.country}</span></p>
                                        <p><span className="text-on-surface-variant">Timezone:</span> <span className="font-medium">{org.timezone}</span></p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">System Info</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-on-surface-variant">Billing Cycle:</span> <span className="font-medium capitalize">{org.billingCycle}</span></p>
                                        <p><span className="text-on-surface-variant">API Limit:</span> <span className="font-medium">{org.apiLimit} req/mo</span></p>
                                        <p><span className="text-on-surface-variant">Created By:</span> <span className="font-medium truncate block">{org.createdBy}</span></p>
                                      </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-outline-variant/30">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">Organization Members</h4>
                                      {loadingMembers ? (
                                        <div className="text-sm text-on-surface-variant flex items-center gap-2">
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                          Loading members...
                                        </div>
                                      ) : orgMembers.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                          {orgMembers.map(member => (
                                            <div key={member.userId} className="bg-white p-3 rounded-xl border border-outline-variant flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {member.userId ? member.userId.substring(0,2).toUpperCase() : 'U'}
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold text-on-surface truncate max-w-[120px]">
                                                  {/* For demo purposes, we show userId base64 decoded if it is an email, else just ID */}
                                                  {member.userId?.length > 10 ? 
                                                    (typeof window !== 'undefined' ? (
                                                      // Attempt decode if it looks like btoa email
                                                      !member.userId.includes('-') ? atob(member.userId).split('@')[0] : 'User'
                                                    ) : 'User')
                                                  : 'User'}
                                                </p>
                                                <ModernBadge variant={member.role.includes('admin') ? 'primary' : 'info'} className="text-[10px] capitalize px-1.5 py-0">
                                                  {member.role.replace(/_/g, ' ')}
                                                </ModernBadge>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-on-surface-variant">No members found for this organization.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {filteredOrgs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                            <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            No organizations found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </ModernCard>
          </div>
        </div>
      </DashboardLayout>
  );
}
