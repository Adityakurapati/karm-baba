'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import Link from 'next/link';

export default function PremiumProfilePage() {
  return (
    <DashboardLayout>
      <TopHeader />
      
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Premium Profile
          </h1>
          <p className="text-on-surface-variant">
            Upgrade your profile to unlock exclusive features
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Current Profile */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-outline-variant p-8 mb-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Your Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface-variant mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value="Global Tech Solutions"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-headline font-bold text-on-surface-variant mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value="United States"
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-headline font-bold text-on-surface-variant mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value="Electronics & Technology"
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface-variant mb-2">
                    Business Description
                  </label>
                  <textarea
                    value="We are a leading provider of technology solutions for global businesses."
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    rows={4}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-outline-variant p-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Certifications & Badges
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '✓', label: 'Verified Business', status: 'active' },
                  { icon: '★', label: 'Top Seller', status: 'inactive' },
                  { icon: '🏆', label: 'Premium Member', status: 'inactive' },
                  { icon: '📋', label: 'ISO Certified', status: 'pending' },
                  { icon: '🌟', label: 'Trusted Trader', status: 'inactive' },
                  { icon: '💰', label: 'Large Volume Buyer', status: 'inactive' },
                ].map((cert, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border text-center ${
                      cert.status === 'active'
                        ? 'bg-green-50 border-green-200'
                        : cert.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-outline-variant'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cert.icon}</div>
                    <p className="text-sm font-headline font-bold text-on-surface mb-1">
                      {cert.label}
                    </p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      cert.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : cert.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white h-fit sticky top-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-black mb-3">👑</div>
              <h3 className="text-2xl font-headline font-black mb-2">
                Go Premium
              </h3>
              <p className="text-sm opacity-90">
                Unlock exclusive features and increase your visibility
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
              {[
                'Priority Deal Matching',
                'Advanced Analytics',
                'Featured Listing',
                'Dedicated Support',
                'Custom Branding',
                'API Access',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <div className="text-center mb-3">
                <span className="text-sm opacity-75">Starting at</span>
                <div className="text-3xl font-black">$99</div>
                <span className="text-sm opacity-75">/month</span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full py-3 bg-white text-primary font-headline font-bold rounded-lg hover:bg-surface-container-lowest transition-colors">
              Upgrade Now
            </button>

            {/* Link */}
            <Link
              href="/pricing"
              className="block text-center text-sm text-white/75 hover:text-white transition-colors mt-4 underline"
            >
              View all plans
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
