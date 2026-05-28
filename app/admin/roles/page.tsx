'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { useAuth } from '@/lib/auth-context';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@/lib/types';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'manager', 'analyst', 'vendor_user'];
const ALL_PERMISSIONS = [
  'manageUsers',
  'manageRoles',
  'viewCRM',
  'manageCRM',
  'uploadPricing',
  'approveVendors',
  'manageBusinessProfiles',
  'manageOrganizations',
  'accessAnalytics'
];

export default function AdminRolesPage() {
  const { user } = useAuth();
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRef = ref(database, 'rolePermissions');
        const snapshot = await get(rolesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const parsedRoles: Record<string, string[]> = {};
          Object.keys(data).forEach(role => {
            parsedRoles[role] = data[role].permissions || [];
          });
          setRolePermissions(parsedRoles);
        } else {
          // Initialize defaults
          setRolePermissions({
            'super_admin': ['all'],
            'admin': ['manageUsers', 'manageVendors', 'viewCRM', 'manageCRM', 'uploadPricing'],
            'manager': ['viewCRM', 'manageCRM', 'manageVendors'],
            'analyst': ['viewCRM', 'accessAnalytics'],
            'vendor_user': []
          });
        }
      } catch (err: any) {
        setError('Failed to load roles: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleTogglePermission = (role: UserRole, permission: string) => {
    // Only super_admin can change role permissions
    if (user?.role !== 'super_admin') {
      setError('Only Super Admins can modify role permissions');
      return;
    }

    if (role === 'super_admin') return; // Cannot modify super admin

    setRolePermissions(prev => {
      const currentPerms = prev[role] || [];
      const isGranted = currentPerms.includes(permission) || currentPerms.includes('all');
      
      let newPerms: string[];
      if (isGranted) {
        newPerms = currentPerms.filter(p => p !== permission && p !== 'all');
      } else {
        newPerms = [...currentPerms, permission];
      }
      
      return { ...prev, [role]: newPerms };
    });
  };

  const handleSave = async () => {
    if (user?.role !== 'super_admin') return;
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const updates: any = {};
      Object.entries(rolePermissions).forEach(([role, perms]) => {
        updates[role] = { permissions: perms };
      });
      await set(ref(database, 'rolePermissions'), updates);
      setSuccess('Role permissions saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to save roles: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Role Permissions</h1>
                <p className="text-on-surface-variant mt-1">Manage access control matrix</p>
              </div>
              {user?.role === 'super_admin' && (
                <ModernButton variant="primary" loading={saving} onClick={handleSave}>
                  Save Changes
                </ModernButton>
              )}
            </div>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-success/10 border border-success/20 text-success rounded-xl font-medium flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                {success}
              </div>
            )}

            {user?.role !== 'super_admin' && (
              <div className="p-4 bg-warning/10 border border-warning/20 text-warning-dark rounded-xl font-medium">
                You are viewing this page in read-only mode. Only Super Admins can modify role permissions.
              </div>
            )}

            <ModernCard className="p-6 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-outline-variant bg-surface-container-low font-bold text-on-surface sticky left-0 z-10 w-64">
                        Permissions
                      </th>
                      {ALL_ROLES.map(role => (
                        <th key={role} className="p-4 border-b border-outline-variant text-center font-bold text-on-surface capitalize">
                          {role.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PERMISSIONS.map(permission => (
                      <tr key={permission} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-4 border-b border-outline-variant font-medium text-sm text-on-surface sticky left-0 bg-white">
                          {permission.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
                        </td>
                        {ALL_ROLES.map(role => {
                          const perms = rolePermissions[role] || [];
                          const isGranted = perms.includes('all') || perms.includes(permission);
                          const isSuperAdmin = role === 'super_admin';
                          
                          return (
                            <td key={`${role}-${permission}`} className="p-4 border-b border-outline-variant text-center">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 rounded text-primary focus:ring-primary/40 disabled:opacity-50"
                                  checked={isGranted}
                                  disabled={isSuperAdmin || user?.role !== 'super_admin'}
                                  onChange={() => handleTogglePermission(role, permission)}
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
