'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { getOrganizationData, getOrganizationMembers, inviteMember, removeMember, suspendInvitation, updateMemberRole } from '@/lib/services/org-services';
import { OrganizationMember, OrganizationInvitation, OrgRole } from '@/lib/types';
import { inviteMemberSchema, InviteMemberData } from '@/lib/org-validation';
import { UsersIcon, UserPlusIcon, TrashIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function OrganizationMembersPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [allMembers, setAllMembers] = useState<any[]>([]);
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
    
    // Real-time listener for members and invitations
    const membersRef = ref(database, `organizationMembers/${id}`);
    const invitationsRef = query(ref(database, 'organizationInvitations'), orderByChild('organizationId'), equalTo(id as string));
    const usersRef = ref(database, 'users');

    let usersData: Record<string, any> = {};
    let currentMembers: any[] = [];
    let currentInvitations: any[] = [];

    const updateCombinedList = () => {
      setAllMembers([...currentMembers, ...currentInvitations]);
      setLoading(false);
    };

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        usersData = snapshot.val();
      }
    });

    const unsubMembers = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        currentMembers = Object.keys(data).map(key => {
          const m = data[key];
          const uData = usersData[key];
          return {
            ...m,
            type: 'member',
            joinedAt: new Date(m.joinedAt),
            email: uData?.email || 'Unknown',
            name: uData ? `${uData.firstName} ${uData.lastName}` : 'Unknown',
            status: 'Active'
          };
        });
      } else {
        currentMembers = [];
      }
      updateCombinedList();
    });

    const unsubInvites = onValue(invitationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        currentInvitations = Object.keys(data).map(key => {
          const inv = data[key];
          return {
            ...inv,
            type: 'invitation',
            joinedAt: new Date(inv.invitedAt),
            email: inv.email,
            name: 'Pending User',
            role: inv.role,
            status: inv.invitationStatus === 'Pending' ? 'Invited' : inv.invitationStatus,
            userId: key // use invite id as userId for keying
          };
        });
      } else {
        currentInvitations = [];
      }
      updateCombinedList();
    });
    
    return () => {
      unsubUsers();
      unsubMembers();
      unsubInvites();
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
      setSuccess('Member removed successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (userId: string, newRole: OrgRole) => {
    if (!confirm(`Are you sure you want to change their role to ${newRole.replace(/_/g, ' ')}?`)) return;
    try {
      await updateMemberRole(id as string, userId, newRole);
      setSuccess('Role updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to update role');
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
  const currentUserOrgRole = allMembers.find(m => m.userId === user?.id && m.type === 'member')?.role;
  const isAdmin = currentUserOrgRole === 'organization_admin' || currentUserOrgRole === 'organization_super_admin' || user?.role === 'super_admin';
  const isSuperAdmin = currentUserOrgRole === 'organization_super_admin' || user?.role === 'super_admin';

  const handleSuspend = async (inviteId: string) => {
    if (!confirm('Are you sure you want to suspend this invitation?')) return;
    try {
      await suspendInvitation(inviteId);
      setSuccess('Invitation suspended successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to suspend invitation');
    }
  };

  return (
    <DashboardLayout title="Dashboard">
        <div className="p-4 md:p-8">
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
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold">Joined / Invited</th>
                      {isAdmin && <th className="pb-3 font-bold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {allMembers.map((m) => (
                      <tr key={m.userId} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${m.type === 'invitation' ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                            {m.name?.[0] || m.email[0].toUpperCase()}
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
                          {isSuperAdmin && m.type === 'member' && m.userId !== user?.id ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.userId, e.target.value as OrgRole)}
                              className="bg-white border border-outline-variant rounded-lg py-1 px-2 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
                            >
                              <option value="organization_admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="analyst">Analyst</option>
                              <option value="vendor_user">Vendor User</option>
                            </select>
                          ) : (
                            <ModernBadge variant={m.role === 'organization_admin' || m.role === 'organization_super_admin' ? 'primary' : 'info'} className="capitalize">
                              {m.role.replace(/_/g, ' ')}
                            </ModernBadge>
                          )}
                        </td>
                        <td className="py-4">
                          <ModernBadge variant={m.status === 'Active' ? 'success' : m.status === 'Invited' ? 'warning' : 'info'} className="capitalize">
                            {m.status}
                          </ModernBadge>
                        </td>
                        <td className="py-4 text-sm text-on-surface-variant">
                          {m.joinedAt.toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isSuperAdmin && m.type === 'invitation' && m.status === 'Invited' && (
                                <button onClick={() => handleSuspend(m.userId)} className="p-2 text-warning hover:bg-warning/10 rounded-full" title="Suspend Invite">
                                  <NoSymbolIcon className="w-5 h-5" />
                                </button>
                              )}
                              {isSuperAdmin && m.userId !== user?.id && m.role !== 'organization_super_admin' && m.type === 'member' && (
                                <button onClick={() => handleRemove(m.userId)} className="p-2 text-error hover:bg-error/10 rounded-full" title="Remove Member">
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {allMembers.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-on-surface-variant">
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
        </div>
      </DashboardLayout>
  );
}
