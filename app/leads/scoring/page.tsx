'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import Link from 'next/link';

export default function LeadScoringPage() {
  const leads = [
    { id: 1, company: 'Global Tech Solutions', score: 92, status: 'Hot Lead', lastContact: '2 hours ago', value: '$250k' },
    { id: 2, company: 'Export Traders Inc', score: 78, status: 'Warm Lead', lastContact: 'Yesterday', value: '$180k' },
    { id: 3, company: 'Import Partners LLC', score: 65, status: 'Warm Lead', lastContact: '3 days ago', value: '$120k' },
    { id: 4, company: 'Manufacturing USA', score: 52, status: 'Cold Lead', lastContact: '1 week ago', value: '$95k' },
    { id: 5, company: 'Asia Trade Hub', score: 88, status: 'Hot Lead', lastContact: '4 hours ago', value: '$320k' },
    { id: 6, company: 'European Distribution', score: 45, status: 'Cold Lead', lastContact: '2 weeks ago', value: '$60k' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <DashboardLayout>
      <TopHeader searchPlaceholder="Search leads..." />
      
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Lead Scoring
          </h1>
          <p className="text-on-surface-variant">
            AI-powered lead qualification with real-time scoring
          </p>
        </div>

        {/* Score Distribution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Hot Leads</div>
            <div className="text-3xl font-headline font-black text-green-600">3</div>
            <div className="text-xs text-on-surface-variant mt-2">High conversion potential</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Warm Leads</div>
            <div className="text-3xl font-headline font-black text-yellow-600">2</div>
            <div className="text-xs text-on-surface-variant mt-2">Nurture opportunities</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="text-sm text-on-surface-variant mb-2">Cold Leads</div>
            <div className="text-3xl font-headline font-black text-red-600">1</div>
            <div className="text-xs text-on-surface-variant mt-2">Follow-up needed</div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-outline-variant">
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Lead Score</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Last Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Deal Value</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-headline font-bold text-on-surface">{lead.company}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${getScoreBgColor(lead.score)}`}>
                        <span className={`text-sm font-headline font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                        <div className="w-20 h-1.5 bg-outline-variant rounded-full overflow-hidden">
                          <div
                            className={`h-full ${lead.score >= 80 ? 'bg-green-600' : lead.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        lead.status === 'Hot Lead' ? 'bg-green-100 text-green-700' :
                        lead.status === 'Warm Lead' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{lead.lastContact}</td>
                    <td className="px-6 py-4 font-headline font-bold text-primary">{lead.value}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-primary hover:underline text-sm font-bold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
