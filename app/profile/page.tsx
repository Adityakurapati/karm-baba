'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">My Profile</h1>
                <p className="text-on-surface-variant mt-1">Manage your account information</p>
              </div>
              <ModernButton variant="primary" onClick={() => router.push('/profile/edit')}>
                Edit Profile
              </ModernButton>
            </div>

            <ModernCard className="p-0 overflow-hidden">
              <div className="bg-primary/5 h-32 w-full"></div>
              <div className="px-8 pb-8 relative">
                <div className="absolute -top-16 border-4 border-white rounded-full bg-surface-container-high h-32 w-32 flex items-center justify-center overflow-hidden shadow-soft">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
                
                <div className="mt-20 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">{user.firstName} {user.lastName}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <ModernBadge variant="primary" className="capitalize">{user.role.replace('_', ' ')}</ModernBadge>
                      <ModernBadge variant={user.status === 'Active' ? 'success' : 'warning'}>{user.status || 'Active'}</ModernBadge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-on-surface">
                          <EnvelopeIcon className="w-5 h-5 text-on-surface-variant" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface">
                          <PhoneIcon className="w-5 h-5 text-on-surface-variant" />
                          <span>{user.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Professional Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-on-surface">
                          <BriefcaseIcon className="w-5 h-5 text-on-surface-variant" />
                          <span>{user.designation || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface">
                          <BuildingOfficeIcon className="w-5 h-5 text-on-surface-variant" />
                          <span>{user.department || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
