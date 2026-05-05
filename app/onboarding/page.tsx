'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

const roles = [
  {
    id: 'buyer',
    icon: 'package_2',
    title: 'Buyer',
    desc: 'Access the global supply network, manage procurement pipelines, and execute high-volume institutional orders with automated risk mitigation.',
    features: ['Automated RFQ Management', 'Global Logistics Integration'],
    color: 'primary',
  },
  {
    id: 'seller',
    icon: 'factory',
    title: 'Seller',
    desc: 'List production capacity, optimize inventory distribution, and secure multi-year contracts through the sovereign credit-linked marketplace.',
    features: ['Production Monitoring', 'Direct Channel Liquidity'],
    color: 'secondary',
  },
];

export default function OnboardingRoleSelectionPage() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;
    
    setIsSaving(true);
    try {
      let success = false;
      if (selectedRole !== user.role) {
        success = await updateUserProfile({ 
          role: selectedRole as UserRole,
          onboardingStep: 2 
        });
      } else {
        success = await updateUserProfile({ onboardingStep: 2 });
      }
      
      if (success) {
        router.push('/onboarding/industry');
      } else {
        alert('Failed to save your selection. Please try again.');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-5xl mx-auto p-8 md:p-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Identity Protocol</span>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">Role Selection</h1>
            </div>
            <div className="text-right">
              <span className="text-on-surface-variant text-sm">Step 1 of 5</span>
              <div className="w-48 h-1.5 bg-surface-container mt-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-1/5 transition-all"></div>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Define your position within the ecosystem. This selection tailors your interface, data feeds, and execution tools.
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative flex flex-col text-left p-8 md:p-10 bg-white rounded-xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                selectedRole === role.id
                  ? 'border-primary shadow-lg shadow-primary/10'
                  : 'border-transparent hover:border-primary/30'
              }`}
            >
              {/* Selected Check */}
              <div className={`absolute top-6 right-6 transition-opacity ${selectedRole === role.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${
                role.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              } group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-4xl">{role.icon}</span>
              </div>

              <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">{role.title}</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">{role.desc}</p>

              <div className="mt-auto pt-6 border-t border-outline-variant/10">
                <ul className="space-y-3">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className={`material-symbols-outlined text-sm ${role.color === 'primary' ? 'text-primary' : 'text-secondary'}`}>token</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>

        {/* Action Area */}
        <div className="mt-16 flex flex-col items-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isSaving || authLoading || !user}
            className={`px-12 py-4 font-headline font-bold text-lg rounded-full transition-all duration-200 shadow-lg relative z-10 ${
              selectedRole && !isSaving && !authLoading && user
                ? 'text-white hover:scale-105 shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed shadow-none'
            }`}
            style={selectedRole && !authLoading && user ? { background: 'linear-gradient(135deg, #e55a24, #ff6b35)' } : {}}
          >
            {isSaving ? 'Saving...' : authLoading ? 'Loading Profile...' : 'Continue with Selection'}
          </button>
          <p className="mt-6 text-on-surface-variant text-sm">
            You can refine your organizational profile in the next step.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
