'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { ref, query, orderByChild, equalTo, get, update, serverTimestamp, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Organization } from '@/lib/types';
import { DB_ORG_MEMBERS } from '@/lib/services/org-services';

export default function OrganizationLogin() {
  const router = useRouter();
  const { organizationLogin } = useAuth();
  
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const hashedPin = btoa(pin);
      const isEmail = phoneOrEmail.includes('@');
      
      let foundOrgId = null;
      let foundOrg: Organization | null = null;
      let memberRole = 'vendor_user';

      if (!isEmail) {
        // Phone number login (Organization Creator/Admin)
        const orgsRef = ref(database, 'organizations');
        const phoneQuery = query(orgsRef, orderByChild('phoneNumber'), equalTo(phoneOrEmail));
        const snapshot = await get(phoneQuery);

        if (!snapshot.exists()) {
          throw new Error('Invalid Phone Number or PIN.');
        }

        snapshot.forEach((childSnap) => {
          const org = childSnap.val();
          if (org.hashedPin === hashedPin) {
            foundOrgId = childSnap.key;
            foundOrg = org;
            memberRole = 'organization_super_admin'; // Creator is default super admin
          }
        });
      } else {
        // Email login (Invited Member)
        const invitesRef = ref(database, 'organizationInvitations');
        const emailQuery = query(invitesRef, orderByChild('email'), equalTo(phoneOrEmail.toLowerCase()));
        const snapshot = await get(emailQuery);

        if (!snapshot.exists()) {
          throw new Error('Invalid Email or PIN.');
        }

        let inviteFound = false;
        let inviteKey = null;
        let inviteData: any = null;

        snapshot.forEach((childSnap) => {
          const inv = childSnap.val();
          // We check the PIN, and we allow them to log in if their status is Pending or Accepted.
          // This allows them to re-use the PIN to log in multiple times.
          if (inv.hashedPin === hashedPin) {
            inviteFound = true;
            foundOrgId = inv.organizationId;
            memberRole = inv.role;
            inviteKey = childSnap.key;
            inviteData = inv;
          }
        });

        if (!inviteFound || !foundOrgId) {
          throw new Error('Invalid Email or PIN.');
        }

        // Check if the organization exists
        const orgRef = ref(database, `organizations/${foundOrgId}`);
        const orgSnap = await get(orgRef);
        if (!orgSnap.exists()) {
          throw new Error('Associated organization no longer exists.');
        }
        foundOrg = orgSnap.val() as Organization;

        // If it was their first time logging in, mark invite as accepted
        if (inviteData.invitationStatus === 'Pending' && inviteKey) {
          await update(ref(database, `organizationInvitations/${inviteKey}`), {
            invitationStatus: 'Accepted',
            acceptedAt: serverTimestamp()
          });
          
          // Also create an entry in the organization_members node (demo setup)
          // In a full app, we would wait for them to register a Firebase Auth user first.
          // For now, we mock their user ID as their email base64 encoded.
          const mockUserId = btoa(phoneOrEmail).replace(/=/g, '');
          await set(ref(database, `${DB_ORG_MEMBERS}/${foundOrgId}/${mockUserId}`), {
            userId: mockUserId,
            role: memberRole,
            joinedAt: serverTimestamp(),
            invitedBy: inviteData.invitedBy
          });
        }
      }

      if (!foundOrgId || !foundOrg) {
        throw new Error('Invalid Credentials.');
      }

      // Check Admin Approval Gate
      if (foundOrg.status === 'Pending') {
        throw new Error('Your organization is pending approval from the Platform Administrator. Please check back later.');
      }

      if (foundOrg.status === 'Rejected' || foundOrg.status === 'Suspended') {
        throw new Error(`Your organization account is ${foundOrg.status.toLowerCase()}. Contact support.`);
      }

      // Success! Update the current user session to this organization.
      await organizationLogin(foundOrgId, memberRole, phoneOrEmail);
      
      window.location.href = `/organizations/${foundOrgId}`;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-soft">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="KARM BABA" width={60} height={60} unoptimized />
          </Link>
          <h2 className="text-2xl font-black text-on-surface flex items-center justify-center gap-3">
            <BuildingStorefrontIcon className="w-7 h-7 text-primary" />
            Organization Login
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm">Secure Portal for Organization Management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <ModernInput 
            label="Phone Number or Email" 
            type="text" 
            placeholder="Enter registered phone or email"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            required
          />
          <ModernInput 
            label="4-Digit PIN" 
            type="password" 
            maxLength={4}
            placeholder="Enter your PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <div className="pt-2">
            <ModernButton type="submit" variant="primary" fullWidth loading={loading}>
              Access Dashboard
            </ModernButton>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an organization registered yet?{' '}
            <Link href="/organizations/create" className="text-primary font-bold hover:underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
