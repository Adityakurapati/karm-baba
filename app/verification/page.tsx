'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function VerificationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <Sidebar open={sidebarOpen} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Verification & Trust
          </h1>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto max-w-4xl">
          {/* Trust Score */}
          <div className="bg-white rounded-xl border border-outline-variant p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
                  Trust Score
                </h2>
                <p className="text-on-surface-variant">
                  Your verification status across KARM BABA
                </p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-headline font-black text-primary mb-2">
                  92%
                </div>
                <p className="text-sm text-on-surface-variant">Highly Trusted Trader</p>
              </div>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-4 mb-8">
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
                  className="bg-white rounded-xl border border-outline-variant p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isVerified ? (
                          <span className="material-symbols-outlined text-primary filled text-2xl">
                            verified
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-2xl">
                            pending
                          </span>
                        )}
                        <h3 className="text-lg font-headline font-bold text-on-surface">
                          {check.name}
                        </h3>
                      </div>
                      <p className="text-on-surface-variant ml-11">{check.description}</p>
                    </div>
                    <div className="text-right">
                      {isVerified ? (
                        <div>
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 mb-2">
                            Verified
                          </span>
                          <p className="text-xs text-on-surface-variant">
                            {status.date}
                          </p>
                        </div>
                      ) : (
                        <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors">
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
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <h2 className="text-xl font-headline font-black text-on-surface mb-6">
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
                    <span className="material-symbols-outlined text-primary">
                      check_circle
                    </span>
                    <p className="text-on-surface-variant">{entry.action}</p>
                  </div>
                  <p className="text-sm text-on-surface-variant">{entry.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
