'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { Organization } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { BuildingOfficeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ModernButton } from '@/components/ModernButton';

export default function AdminOrganizationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

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
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Tenant Organizations</h1>
                <p className="text-on-surface-variant mt-1">Manage platform workspaces and subscriptions</p>
              </div>
              <ModernButton variant="primary" onClick={() => router.push('/admin/organizations/pending-approvals')}>
                Review Approvals
              </ModernButton>
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
                  {['All', 'Approved', 'Pending', 'Suspended', 'Rejected'].map(f => (
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
                        <th className="pb-3 font-bold">Organization</th>
                        <th className="pb-3 font-bold">Plan & Limits</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Created</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredOrgs.map((org) => (
                        <tr key={org.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-outline-variant flex items-center justify-center text-primary font-bold overflow-hidden">
                              {org.logo ? <img src={org.logo} alt="" className="w-full h-full object-cover" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface truncate max-w-[200px]" title={org.name}>{org.name}</p>
                              <p className="text-xs text-on-surface-variant truncate max-w-[200px]" title={org.gstin}>GSTIN: {org.gstin}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="font-bold text-sm text-on-surface">{org.subscriptionPlan}</p>
                            <p className="text-xs text-on-surface-variant">{org.userLimit} Users | {org.storageLimit}GB</p>
                          </td>
                          <td className="py-4">
                            <ModernBadge 
                              variant={
                                org.status === 'Approved' ? 'success' : 
                                org.status === 'Suspended' || org.status === 'Rejected' ? 'error' : 
                                'warning'
                              }
                            >
                              {org.status}
                            </ModernBadge>
                            {org.paymentStatus === 'Trial' && (
                              <span className="ml-2 text-[10px] font-bold text-secondary-dark bg-secondary/10 px-2 py-0.5 rounded-full">TRIAL</span>
                            )}
                          </td>
                          <td className="py-4 text-sm text-on-surface-variant">
                            {org.createdAt.toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <ModernButton variant="outline" className="text-xs py-1.5 px-3" onClick={() => router.push(`/organizations/${org.id}`)}>
                              View Dashboard
                            </ModernButton>
                          </td>
                        </tr>
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
        </main>
      </div>
    </div>
  );
}
