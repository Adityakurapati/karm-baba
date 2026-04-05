'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer / Importer',
      description: 'Looking to source products and materials globally',
      icon: '🛒',
      features: ['Find suppliers', 'Compare prices', 'Manage RFQs'],
    },
    {
      id: 'supplier',
      title: 'Supplier / Exporter',
      description: 'Offering products and services to global market',
      icon: '📦',
      features: ['List products', 'Manage orders', 'Track shipments'],
    },
    {
      id: 'trader',
      title: 'Trader / Agent',
      description: 'Connecting buyers and suppliers for mutual benefit',
      icon: '💼',
      features: ['Build network', 'Broker deals', 'Earn commissions'],
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/onboarding/account?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-black text-on-surface mb-4">
            Welcome to KARM BABA
          </h1>
          <p className="text-lg text-on-surface-variant">
            Let's get you started. Who are you?
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-8 rounded-xl border-2 transition-all text-left ${
                selectedRole === role.id
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
                {role.title}
              </h3>
              <p className="text-on-surface-variant mb-4">{role.description}</p>
              <ul className="space-y-2">
                {role.features.map((feature, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex items-center gap-2">
                    <span className="text-primary">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 border-2 border-primary text-primary font-headline font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Back
          </Link>
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-8 py-3 font-headline font-bold rounded-lg transition-colors ${
              selectedRole
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
