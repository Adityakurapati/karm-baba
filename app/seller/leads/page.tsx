'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getLeadsBySellerId, mockUsers } from '@/lib/mockData';
import { ModernStatCard } from '@/components/ModernStatCard';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { ModernButton } from '@/components/ModernButton';
import { ModernInput } from '@/components/ModernInput';

export default function SellerLeadsPage() {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');

  if (isLoading || !user) return null;

  const leads = getLeadsBySellerId(user.id);

  const filteredLeads = leads.filter(lead => {
    const buyerInfo = mockUsers.find(u => u.id === lead.buyerId);
    const matchesSearch = buyerInfo?.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesScore = filterScore === 'all' || 
      (filterScore === 'excellent' && lead.leadScore >= 90) ||
      (filterScore === 'good' && lead.leadScore >= 75 && lead.leadScore < 90) ||
      (filterScore === 'fair' && lead.leadScore >= 60 && lead.leadScore < 75) ||
      (filterScore === 'poor' && lead.leadScore < 60);
    return matchesSearch && matchesStatus && matchesScore;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'primary';
      case 'hot': return 'warning';
      case 'negotiation': return 'warning';
      case 'closed': return 'success';
      case 'lost': return 'error';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🆕';
      case 'contacted': return '📞';
      case 'hot': return '🔥';
      case 'negotiation': return '💬';
      case 'closed': return '✅';
      case 'lost': return '❌';
      default: return '📌';
    }
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    if (score >= 60) return 'primary';
    return 'error';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          {/* Header */}
          <div className="mb-12 animate-slide-in-down">
            <h1 className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary mb-3">
              Lead Management
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              Track buyer inquiries, manage communication, and convert leads to deals
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ModernStatCard
              label="Total Leads"
              value={leads.length}
              icon="👥"
              color="blue"
            />
            <ModernStatCard
              label="Hot Leads"
              value={leads.filter(l => l.status === 'hot').length}
              icon="🔥"
              color="red"
              change="+3 this week"
              changeType="up"
            />
            <ModernStatCard
              label="Negotiating"
              value={leads.filter(l => l.status === 'negotiation').length}
              icon="💬"
              color="orange"
            />
            <ModernStatCard
              label="Closed Deals"
              value={leads.filter(l => l.status === 'closed').length}
              icon="✅"
              color="green"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-in-down">
            <ModernInput
              label="Search"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
            />
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="hot">Hot</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Lead Score</label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
              >
                <option value="all">All Scores</option>
                <option value="excellent">90+ (Excellent)</option>
                <option value="good">75-89 (Good)</option>
                <option value="fair">60-74 (Fair)</option>
                <option value="poor">Below 60 (Poor)</option>
              </select>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="animate-slide-in-up">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-headline font-black text-on-surface">
                Active Leads
              </h2>
              <span className="inline-block bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                {filteredLeads.length}
              </span>
            </div>

            {filteredLeads.length === 0 ? (
              <ModernCard className="p-12 text-center">
                <p className="text-lg font-bold text-on-surface-light mb-4">No leads found</p>
                <ModernButton variant="primary" size="md" as="link">
                  <Link href="/seller/products">Add Products to Attract Leads</Link>
                </ModernButton>
              </ModernCard>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredLeads.map((lead, idx) => {
                  const buyerInfo = mockUsers.find(u => u.id === lead.buyerId);
                  return (
                    <ModernCard key={lead.id} hover gradient className="p-6 group" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                            {buyerInfo?.company.name || 'Unknown Buyer'}
                          </h3>
                          <p className="text-sm text-on-surface-light">
                            {buyerInfo?.company.location} • {buyerInfo?.company.industry}
                          </p>
                        </div>
                        <ModernBadge variant={getStatusVariant(lead.status)} icon={getStatusIcon(lead.status)}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </ModernBadge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-outline-variant">
                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Lead Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                style={{ width: `${lead.leadScore}%` }}
                              />
                            </div>
                            <span className="font-bold text-on-surface">{lead.leadScore}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Last Contact</p>
                          <p className="font-bold text-on-surface">
                            {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : 'Never'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Messages</p>
                          <p className="font-bold text-on-surface">{lead.conversationHistory.length}</p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Contact</p>
                          <p className="font-bold text-on-surface text-sm">{buyerInfo?.firstName} {buyerInfo?.lastName}</p>
                          <p className="text-xs text-on-surface-light">{buyerInfo?.email}</p>
                        </div>
                      </div>

                      {lead.conversationHistory.length > 0 && (
                        <div className="p-4 bg-primary-ultra-light rounded-lg mb-6 border border-primary/20">
                          <p className="text-xs font-bold text-on-surface-light uppercase mb-2">Latest Message</p>
                          <p className="text-sm text-on-surface">
                            {lead.conversationHistory[lead.conversationHistory.length - 1].content}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <ModernButton variant="outline" size="sm" className="flex-1">
                          <Link href={`/seller/leads/${lead.id}`}>View Conversation</Link>
                        </ModernButton>
                        <ModernButton variant="primary" size="sm" className="flex-1">
                          Send Quote
                        </ModernButton>
                        <ModernButton variant="secondary" size="sm" className="flex-1">
                          Schedule Call
                        </ModernButton>
                      </div>
                    </ModernCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
