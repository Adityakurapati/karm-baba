'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function VerificationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const verificationStatus = {
    email: { status: 'verified', date: '2024-01-15' },
    phone: { status: 'verified', date: '2024-01-15' },
    business: { status: 'verified', date: '2024-01-16' },
    payment: { status: 'pending', date: null },
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-4 md:p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl md:text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Verification & Trust
          </h1>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-auto max-w-4xl">
          {/* Trust Score */}
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-headline font-black text-on-surface mb-2">
                  Trust Score
                </h2>
                <p className="text-on-surface-variant text-sm md:text-base">
                  Your verification status across KARM BABA
                </p>
              </div>
              <div className="sm:text-right">
                <div className="text-5xl md:text-6xl font-headline font-black text-primary mb-2">
                  92%
                </div>
                <p className="text-sm text-on-surface-variant">Highly Trusted Trader</p>
              </div>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {[
              { id: 'email', name: 'Email Verification', description: 'Confirm your email address' },
              { id: 'phone', name: 'Phone Verification', description: 'Verify your phone number' },
              { id: 'business', name: 'Business Verification', description: 'Confirm company documents' },
              { id: 'payment', name: 'Payment Verification', description: 'Link and verify payment method' },
            ].map((check) => {
              const status = verificationStatus[check.id as keyof typeof verificationStatus];
              const isVerified = status.status === 'verified';

              return (
                <div
                  key={check.id}
                  className="bg-white rounded-xl border border-outline-variant p-4 md:p-6 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isVerified ? (
                          <span className="material-symbols-outlined text-primary filled text-xl md:text-2xl">
                            verified
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-xl md:text-2xl">
                            pending
                          </span>
                        )}
                        <h3 className="text-base md:text-lg font-headline font-bold text-on-surface">
                          {check.name}
                        </h3>
                      </div>
                      <p className="text-on-surface-variant text-sm ml-8 md:ml-11">{check.description}</p>
                    </div>
                    <div className="ml-8 md:ml-0 sm:text-right flex-shrink-0">
                      {isVerified ? (
                        <div>
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 mb-1 md:mb-2">
                            Verified
                          </span>
                          <p className="text-xs text-on-surface-variant">
                            {status.date}
                          </p>
                        </div>
                      ) : (
                        <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm">
                          Verify Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification History */}
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-headline font-black text-on-surface mb-4 md:mb-6">
              Verification History
            </h2>
            <div className="space-y-4">
              {[
                { action: 'Email verified', date: '2024-01-15' },
                { action: 'Phone verified', date: '2024-01-15' },
                { action: 'Business documents approved', date: '2024-01-16' },
                { action: 'Account created', date: '2024-01-14' },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-outline-variant last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg md:text-xl">
                      check_circle
                    </span>
                    <p className="text-on-surface-variant text-sm md:text-base">{entry.action}</p>
                  </div>
                  <p className="text-xs md:text-sm text-on-surface-variant">{entry.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
