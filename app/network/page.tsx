'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function NetworkPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const contacts = [
    {
      id: 1,
      name: 'Tech Corp USA',
      type: 'buyer',
      country: 'United States',
      rating: 4.8,
      deals: 12,
      verified: true,
    },
    {
      id: 2,
      name: 'TechManufacture Ltd',
      type: 'supplier',
      country: 'China',
      rating: 4.6,
      deals: 24,
      verified: true,
    },
    {
      id: 3,
      name: 'Global Trade Partners',
      type: 'trader',
      country: 'Dubai',
      rating: 4.9,
      deals: 45,
      verified: true,
    },
    {
      id: 4,
      name: 'Fashion Retailers EU',
      type: 'buyer',
      country: 'Germany',
      rating: 4.5,
      deals: 8,
      verified: true,
    },
    {
      id: 5,
      name: 'TextilePro Inc',
      type: 'supplier',
      country: 'India',
      rating: 4.7,
      deals: 18,
      verified: true,
    },
    {
      id: 6,
      name: 'Manufacturing Ltd',
      type: 'buyer',
      country: 'Japan',
      rating: 4.4,
      deals: 6,
      verified: true,
    },
  ];

  const filteredContacts = contacts.filter((contact) => {
    const matchesType = filterType === 'all' || contact.type === filterType;
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buyer':
        return '🛒';
      case 'supplier':
        return '📦';
      case 'trader':
        return '💼';
      default:
        return '👤';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buyer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'supplier':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'trader':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
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
            Verified Network
          </h1>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              {['all', 'buyer', 'supplier', 'trader'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    filterType === type
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface hover:border-primary border border-outline-variant'
                  }`}
                >
                  {type === 'all'
                    ? 'All'
                    : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Network Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-xl border border-outline-variant hover:border-primary hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">{getTypeIcon(contact.type)}</div>
                    <h3 className="text-lg font-headline font-bold text-on-surface">
                      {contact.name}
                    </h3>
                  </div>
                  {contact.verified && (
                    <span className="material-symbols-outlined text-primary text-xl filled">
                      verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-base">
                      public
                    </span>
                    {contact.country}
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-base">
                      store
                    </span>
                    {contact.deals} completed deals
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(contact.rating) ? '⭐' : '☆'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-on-surface-variant ml-2">
                    ({contact.rating})
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors">
                    Connect
                  </button>
                </div>

                <span
                  className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(
                    contact.type
                  )}`}
                >
                  {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-on-surface-variant mb-4">No contacts found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
