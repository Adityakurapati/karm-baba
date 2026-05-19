'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const router = useRouter();

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      icon: 'shopping_cart',
      description: 'Looking to source materials, products, or services from verified suppliers globally',
      benefits: ['Access supplier network', 'Request quotes', 'Verify suppliers'],
      action: 'I am a Buyer',
    },
    {
      id: 'supplier',
      title: 'Supplier',
      icon: 'local_shipping',
      description: 'Selling products or services and want to reach qualified buyers worldwide',
      benefits: ['Post products', 'Receive inquiries', 'Build reputation'],
      action: 'I am a Supplier',
    },
    {
      id: 'trader',
      title: 'Trader',
      icon: 'trending_up',
      description: 'Trading commodities, importing, exporting, or facilitating B2B transactions',
      benefits: ['Create deal networks', 'Connect partners', 'Execute trades'],
      action: 'I am a Trader',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-headline font-black text-on-surface mb-4">
            How do you use KARM BABA?
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Select your role to get started. You can always change this later.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl border border-outline-variant p-8 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
              onClick={() => router.push(`/onboarding/account?role=${role.id}`)}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined notranslate text-white text-3xl" translate="no" style={{fontSize: '32px'}}>
                  {role.icon}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
                {role.title}
              </h2>
              <p className="text-on-surface-variant mb-6 leading-relaxed">
                {role.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2 mb-8">
                {role.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-on-surface-variant">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => router.push(`/onboarding/account?role=${role.id}`)}
                className="w-full py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container transition-colors"
              >
                {role.action}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-on-surface-variant text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
