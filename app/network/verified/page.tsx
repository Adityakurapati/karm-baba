'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import Link from 'next/link';
import { useState } from 'react';

export default function VerifiedNetworkPage() {
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'supplier' | 'trader'>('all');

  const members = [
    {
      id: 1,
      name: 'Global Tech Solutions',
      type: 'buyer',
      country: 'United States',
      verificationScore: 98,
      dealsClosed: 24,
      image: '🏢',
    },
    {
      id: 2,
      name: 'Asia Manufacturing Co',
      type: 'supplier',
      country: 'China',
      verificationScore: 95,
      dealsClosed: 38,
      image: '🏭',
    },
    {
      id: 3,
      name: 'European Trade Hub',
      type: 'trader',
      country: 'Germany',
      verificationScore: 92,
      dealsClosed: 52,
      image: '🌍',
    },
    {
      id: 4,
      name: 'Premium Exports Ltd',
      type: 'supplier',
      country: 'India',
      verificationScore: 89,
      dealsClosed: 31,
      image: '📦',
    },
    {
      id: 5,
      name: 'Industrial Buyers Corp',
      type: 'buyer',
      country: 'Japan',
      verificationScore: 87,
      dealsClosed: 19,
      image: '🏢',
    },
    {
      id: 6,
      name: 'International Trade Partners',
      type: 'trader',
      country: 'United Arab Emirates',
      verificationScore: 85,
      dealsClosed: 41,
      image: '🤝',
    },
  ];

  const filteredMembers = filterType === 'all' 
    ? members 
    : members.filter(m => m.type === filterType);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'buyer': return 'bg-blue-100 text-blue-700';
      case 'supplier': return 'bg-green-100 text-green-700';
      case 'trader': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <TopHeader searchPlaceholder="Search network members..." />
      
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Verified Network
          </h1>
          <p className="text-on-surface-variant">
            Connect with {filteredMembers.length} verified traders, suppliers, and buyers
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 border-b border-outline-variant pb-4">
          {['all', 'buyer', 'supplier', 'trader'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-lg font-headline font-bold text-sm transition-colors ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {type === 'all' ? 'All Members' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Link
              key={member.id}
              href={`/network/${member.id}`}
              className="bg-white rounded-xl border border-outline-variant p-6 hover:shadow-lg hover:border-primary transition-all"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{member.image}</div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(member.type)}`}>
                  {member.type.charAt(0).toUpperCase() + member.type.slice(1)}
                </span>
              </div>

              {/* Company Info */}
              <h3 className="text-lg font-headline font-black text-on-surface mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-sm">public</span>
                {member.country}
              </p>

              {/* Verification & Deals */}
              <div className="space-y-3 pt-4 border-t border-outline-variant">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Verification Score</span>
                  <span className="font-headline font-bold text-primary">{member.verificationScore}%</span>
                </div>
                <div className="w-full h-2 bg-outline-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${member.verificationScore}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">Deals Closed</span>
                  <span className="font-headline font-bold text-on-surface">{member.dealsClosed}</span>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-4 py-2 bg-primary/10 text-primary font-headline font-bold rounded-lg hover:bg-primary hover:text-white transition-colors text-sm">
                Connect
              </button>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
