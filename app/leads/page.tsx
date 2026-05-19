'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LeadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterScore, setFilterScore] = useState('all');

  const leads = [
    {
      id: 1,
      company: 'Global Tech Solutions',
      contact: 'Sarah Johnson',
      score: 92,
      industry: 'Electronics',
      value: '$250K',
      status: 'Hot Lead',
      lastContact: '2 days ago',
    },
    {
      id: 2,
      company: 'Export Traders Inc',
      contact: 'Ahmed Hassan',
      score: 78,
      industry: 'Textiles',
      value: '$180K',
      status: 'Warm Lead',
      lastContact: '1 week ago',
    },
    {
      id: 3,
      company: 'Import Partners LLC',
      contact: 'Maria Garcia',
      score: 65,
      industry: 'Industrial',
      value: '$320K',
      status: 'Warm Lead',
      lastContact: '2 weeks ago',
    },
    {
      id: 4,
      company: 'Manufacturing Corp',
      contact: 'John Smith',
      score: 45,
      industry: 'Machinery',
      value: '$420K',
      status: 'Cold Lead',
      lastContact: '1 month ago',
    },
    {
      id: 5,
      company: 'Premium Supply Chain',
      contact: 'Lisa Chen',
      score: 88,
      industry: 'Logistics',
      value: '$150K',
      status: 'Hot Lead',
      lastContact: '3 days ago',
    },
  ];

  const filteredLeads = leads.filter((lead) => {
    if (filterScore === 'all') return true;
    if (filterScore === 'hot') return lead.score >= 80;
    if (filterScore === 'warm') return lead.score >= 60 && lead.score < 80;
    if (filterScore === 'cold') return lead.score < 60;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
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
            <span className="material-symbols-outlined notranslate" translate="no">menu</span>
          </button>
          <h1 className="text-xl md:text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Lead Management
          </h1>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-auto">
          {/* Filters */}
          <div className="mb-6 flex gap-2 md:gap-3 flex-wrap">
            {['all', 'hot', 'warm', 'cold'].map((score) => (
              <button
                key={score}
                onClick={() => setFilterScore(score)}
                className={`px-3 md:px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  filterScore === score
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface hover:border-primary border border-outline-variant'
                }`}
              >
                {score === 'all'
                  ? 'All Leads'
                  : score.charAt(0).toUpperCase() + score.slice(1) + ' Leads'}
              </button>
            ))}
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm">
                      Company
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm hidden lg:table-cell">
                      Industry
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm">
                      Score
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm hidden md:table-cell">
                      Est. Value
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm hidden lg:table-cell">
                      Last Contact
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left font-headline font-bold text-on-surface text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <p className="font-headline font-bold text-on-surface text-sm">
                          {lead.company}
                        </p>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-on-surface-variant text-sm hidden sm:table-cell">
                        {lead.contact}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-on-surface-variant text-sm hidden lg:table-cell">
                        {lead.industry}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-12 bg-surface-container rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                lead.score >= 80
                                  ? 'bg-green-500'
                                  : lead.score >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-on-surface w-8">
                            {lead.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-primary text-sm hidden md:table-cell">
                        {lead.value}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-on-surface-variant hidden lg:table-cell">
                        {lead.lastContact}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <button className="px-3 md:px-4 py-2 bg-primary text-white font-bold text-xs md:text-sm rounded hover:bg-primary-dark transition-colors">
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
