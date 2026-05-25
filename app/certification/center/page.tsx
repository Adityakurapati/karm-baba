'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { useState } from 'react';

export default function CertificationCenterPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'expired'>('active');

  const certifications = {
    active: [
      { name: 'GST Registration', issuer: 'Tax Authority', expiryDate: '2025-12-31', score: 95 },
      { name: 'Business License', issuer: 'Municipal Corp', expiryDate: '2026-06-30', score: 98 },
      { name: 'Trade License', issuer: 'Chamber of Commerce', expiryDate: '2025-09-15', score: 92 },
    ],
    pending: [
      { name: 'ISO 9001 Certification', issuer: 'International Standards', estimatedDate: '2024-12-15' },
      { name: 'Export License', issuer: 'Commerce Department', estimatedDate: '2024-11-30' },
    ],
    expired: [
      { name: 'Previous Trade License', issuer: 'Chamber of Commerce', expiredDate: '2023-09-15' },
    ],
  };

  return (
    <DashboardLayout>

      
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Certification Center
          </h1>
          <p className="text-on-surface-variant">
            Manage your business certifications and credentials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Active Certifications</div>
            <div className="text-3xl font-headline font-black text-green-600">3</div>
            <div className="text-xs text-on-surface-variant mt-2">Verified and valid</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Pending</div>
            <div className="text-3xl font-headline font-black text-yellow-600">2</div>
            <div className="text-xs text-on-surface-variant mt-2">Under review</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Expired</div>
            <div className="text-3xl font-headline font-black text-red-600">1</div>
            <div className="text-xs text-on-surface-variant mt-2">Needs renewal</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-outline-variant pb-4">
          {['active', 'pending', 'expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-headline font-bold text-sm transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'active' ? 'Active' : tab === 'pending' ? 'Pending' : 'Expired'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'active' && certifications.active.map((cert, i) => (
            <div key={i} className="bg-white rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-headline font-black text-on-surface mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    Issued by {cert.issuer}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Expires on {new Date(cert.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-headline font-black text-green-600">
                    {cert.score}%
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">Verification Score</div>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'pending' && certifications.pending.map((cert, i) => (
            <div key={i} className="bg-white rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-headline font-black text-on-surface mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    Issued by {cert.issuer}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Under Review
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Expected by {new Date(cert.estimatedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 text-primary font-headline font-bold text-sm hover:bg-primary/10 rounded-lg transition-colors">
                  View Status
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'expired' && certifications.expired.map((cert, i) => (
            <div key={i} className="bg-white rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-headline font-black text-on-surface mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    Issued by {cert.issuer}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded">
                      Expired
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Expired on {new Date(cert.expiredDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 text-primary font-headline font-bold text-sm hover:bg-primary/10 rounded-lg transition-colors">
                  Renew
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
