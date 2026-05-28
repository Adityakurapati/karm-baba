'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { getOrganizationData, getOrganizationMembers, inviteMember, removeMember } from '@/lib/services/org-services';
import { OrganizationMember } from '@/lib/types';
import { inviteMemberSchema, InviteMemberData } from '@/lib/org-validation';
import { UsersIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function OrganizationMembersPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<(OrganizationMember & { email?: string, name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    mode: 'onTouched',
    defaultValues: { role: 'vendor_user' }
  });

  useEffect(() => {
    if (!user || !id) return;
    
    // Real-time listener for members
    const membersRef = ref(database, `organizationMembers/${id}`);
    const usersRef = ref(database, 'users');

    let usersData: Record<string, any> = {};

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        usersData = snapshot.val();
      }
    });

    const unsubMembers = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const membersList = Object.keys(data).map(key => {
          const m = data[key];
          const uData = usersData[key];
          return {
            ...m,
            joinedAt: new Date(m.joinedAt),
            email: uData?.email || 'Unknown',
            name: uData ? `${uData.firstName} ${uData.lastName}` : 'Unknown'
          };
        });
        setMembers(membersList);
      } else {
        setMembers([]);
      }
      setLoading(false);
    });
    
    return () => {
      unsubUsers();
      unsubMembers();
    };
  }, [user, id]);

  const onInvite = async (data: InviteMemberData) => {
    if (!user) return;
    setInviting(true);
    setError('');
    setSuccess('');
    
    try {
      await inviteMember(id as string, data.email, data.role, user.id);
      setSuccess(`Invitation sent to ${data.email}`);
      reset();
      setShowInviteForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMember(id as string, userId);
    } catch (e: any) {
      setError(e.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Find current user's role in this org
  const currentUserOrgRole = members.find(m => m.userId === user?.id)?.role;
  const isAdmin = currentUserOrgRole === 'organization_admin' || user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Team Members</h1>
                <p className="text-on-surface-variant mt-1">Manage organization access and roles</p>
              </div>
              <div className="flex gap-3">
                <ModernButton variant="outline" onClick={() => router.push(`/organizations/${id}`)}>
                  Dashboard
                </ModernButton>
                {isAdmin && (
                  <ModernButton variant="primary" onClick={() => setShowInviteForm(!showInviteForm)} className="flex items-center gap-2">
                    <UserPlusIcon className="w-5 h-5" />
                    Invite Member
                  </ModernButton>
                )}
              </div>
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

            {showInviteForm && isAdmin && (
              <ModernCard className="p-6 bg-primary/5 border border-primary/20">
                <h3 className="text-lg font-bold text-on-surface mb-4">Send Invitation</h3>
                <form onSubmit={handleSubmit(onInvite)} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <ModernInput label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-on-surface mb-2">Role</label>
                    <select {...register('role')} className="w-full bg-white border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none">
                      <option value="organization_admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="analyst">Analyst</option>
                      <option value="vendor_user">Vendor User</option>
                    </select>
                  </div>
                  <ModernButton type="submit" variant="primary" loading={inviting} className="w-full md:w-auto h-12">
                    Send Invite
                  </ModernButton>
                </form>
              </ModernCard>
            )}

            <ModernCard className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant text-sm text-on-surface-variant uppercase tracking-wider">
                      <th className="pb-3 font-bold">User</th>
                      <th className="pb-3 font-bold">Role</th>
                      <th className="pb-3 font-bold">Joined</th>
                      {isAdmin && <th className="pb-3 font-bold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {members.map((m) => (
                      <tr key={m.userId} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {m.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface flex items-center gap-2">
                              {m.name}
                              {m.userId === user?.id && <span className="text-[10px] bg-secondary/10 text-secondary-dark px-2 py-0.5 rounded-full font-bold">YOU</span>}
                            </p>
                            <p className="text-xs text-on-surface-variant">{m.email}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <ModernBadge variant={m.role === 'organization_admin' ? 'primary' : 'info'} className="capitalize">
                            {m.role.replace('_', ' ')}
                          </ModernBadge>
                        </td>
                        <td className="py-4 text-sm text-on-surface-variant">
                          {m.joinedAt.toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td className="py-4 text-right">
                            {m.userId !== user?.id && m.role !== 'organization_admin' && (
                              <button onClick={() => handleRemove(m.userId)} className="p-2 text-error hover:bg-error/10 rounded-full" title="Remove Member">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 4 : 3} className="py-12 text-center text-on-surface-variant">
                          <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          No members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
