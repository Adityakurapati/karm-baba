'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mockUsers } from '@/lib/mockData';
import { ModernStatCard } from '@/components/ModernStatCard';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { ModernCard } from '@/components/ModernCard';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  if (isLoading || !user) return null;

  const users = mockUsers.filter(u => u.role !== 'admin');
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.verificationStatus === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getVerificationVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary mb-3">
              User Management
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Verify users, monitor credibility scores, and manage access levels
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ModernStatCard
              label="Total Users"
              value={users.length}
              icon="👥"
              color="blue"
            />
            <ModernStatCard
              label="Verified"
              value={users.filter(u => u.verificationStatus === 'verified').length}
              icon="✅"
              color="green"
              change="+12% this month"
              changeType="up"
            />
            <ModernStatCard
              label="Pending Review"
              value={users.filter(u => u.verificationStatus === 'pending').length}
              icon="⏳"
              color="yellow"
            />
            <ModernStatCard
              label="Avg Credibility"
              value={Math.round(users.reduce((sum, u) => sum + u.credibilityScore, 0) / users.length)}
              icon="⭐"
              color="orange"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-in-down">
            <ModernInput
              label="Search"
              placeholder="Search by company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
            />
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="animate-slide-in-up">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-headline font-black text-on-surface">
                User Directory
              </h2>
              <span className="inline-block bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                {filteredUsers.length} users
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, idx) => (
                  <ModernCard key={u.id} gradient hover className="p-6 group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                          {u.company.name}
                        </h3>
                        <p className="text-sm text-on-surface-light mt-1">{u.company.location}</p>
                      </div>
                      <ModernBadge variant={u.role === 'buyer' ? 'primary' : 'info'} icon={u.role === 'buyer' ? '🛒' : '🏭'}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </ModernBadge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-outline-variant">
                      <div>
                        <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Contact</p>
                        <p className="text-sm font-bold text-on-surface">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-on-surface-light">{u.email}</p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Credibility Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-success to-green-600"
                              style={{ width: `${u.credibilityScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-on-surface text-sm">{u.credibilityScore}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Risk Level</p>
                        <ModernBadge variant={getRiskVariant(u.riskLevel)}>
                          {u.riskLevel.charAt(0).toUpperCase() + u.riskLevel.slice(1)}
                        </ModernBadge>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Verification</p>
                        <ModernBadge variant={getVerificationVariant(u.verificationStatus)}>
                          {u.verificationStatus.charAt(0).toUpperCase() + u.verificationStatus.slice(1)}
                        </ModernBadge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ModernButton variant="outline" size="sm" className="flex-1">
                        <Link href={`/admin/users/${u.id}`} className="w-full">Review Profile</Link>
                      </ModernButton>
                      {u.verificationStatus === 'pending' && (
                        <>
                          <ModernButton variant="secondary" size="sm" className="flex-1">
                            Approve
                          </ModernButton>
                          <ModernButton variant="danger" size="sm" className="flex-1">
                            Reject
                          </ModernButton>
                        </>
                      )}
                    </div>
                  </ModernCard>
                ))
              ) : (
                <ModernCard className="p-12 text-center">
                  <p className="text-lg font-bold text-on-surface-light">No users found matching your filters</p>
                </ModernCard>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
