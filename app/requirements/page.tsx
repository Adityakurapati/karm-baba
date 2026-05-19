'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';

export default function RequirementsPage() {
  const [filterType, setFilterType] = useState('all');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePostRequirement = () => {
    if (isAuthenticated) {
      router.push('/buyer/requirements/new');
    } else {
      router.push('/login');
    }
  };

  const requirements = [
    {
      id: 1,
      title: 'Electronics Components Needed',
      type: 'buyer',
      quantity: '10,000 units',
      budget: '$150,000',
      deadline: '2024-02-28',
      matches: 12,
      status: 'Active',
    },
    {
      id: 2,
      title: 'Textile Products Supply',
      type: 'buyer',
      quantity: '5,000 kg',
      budget: '$80,000',
      deadline: '2024-03-15',
      matches: 8,
      status: 'Active',
    },
    {
      id: 3,
      title: 'Industrial Raw Materials',
      type: 'buyer',
      quantity: '20 tons',
      budget: '$250,000',
      deadline: '2024-04-30',
      matches: 15,
      status: 'Active',
    },
    {
      id: 4,
      title: 'Machinery Equipment Export',
      type: 'supplier',
      quantity: '50 units',
      budget: '$500,000',
      deadline: '2024-05-15',
      matches: 6,
      status: 'Pending',
    },
  ];

  const filteredReqs = requirements.filter(
    (req) => filterType === 'all' || req.type === filterType
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-slate-50/80 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:h-16 px-4 md:px-8 py-3 sm:py-0 border-b border-slate-200/20">
        <h1 className="text-xl md:text-2xl font-headline font-black text-on-surface">
          Purchase Requirements
        </h1>
        <button 
          onClick={handlePostRequirement}
          className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:opacity-90 transition-all text-sm"
        >
          Post Requirement
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Filters */}
          <div className="mb-6 flex gap-3 flex-wrap">
            {['all', 'buyer', 'supplier'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  filterType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface hover:border-primary border border-outline-variant'
                }`}
              >
                {type === 'all' ? 'All' : type === 'buyer' ? 'Buying' : 'Selling'}
              </button>
            ))}
          </div>

          {/* Requirements List */}
          <div className="space-y-4">
            {filteredReqs.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
                      {req.title}
                    </h3>
                    <div className="flex gap-4 flex-wrap text-sm text-on-surface-variant">
                      <span>Qty: {req.quantity}</span>
                      <span>Budget: {req.budget}</span>
                      <span>Deadline: {req.deadline}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                        req.type === 'buyer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {req.type === 'buyer' ? 'Buying' : 'Selling'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                  <div>
                    <p className="text-sm text-on-surface-variant mb-1">Matching Suppliers</p>
                    <p className="font-headline font-bold text-on-surface">{req.matches} matches</p>
                  </div>
                  <button className="px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors">
                    View Matches
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>
    </DashboardLayout>
  );
}
