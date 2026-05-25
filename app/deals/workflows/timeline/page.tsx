'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

const timelineEvents = [
  {
    id: 1,
    time: '09:00 AM',
    date: 'Today',
    title: 'Auto-Send Proforma Invoice',
    description: 'Triggered when buyer replies to RFQ #KB-8829',
    type: 'email' as const,
    status: 'completed' as const,
    icon: 'email',
  },
  {
    id: 2,
    time: '10:30 AM',
    date: 'Today',
    title: 'Lead Score Update — Apex Logistics',
    description: 'Score upgraded from 72 to 88 based on engagement signals',
    type: 'system' as const,
    status: 'completed' as const,
    icon: 'trending_up',
  },
  {
    id: 3,
    time: '01:00 PM',
    date: 'Today',
    title: 'WhatsApp Follow-up Blast',
    description: '34 qualified leads — personalized follow-up sequence',
    type: 'message' as const,
    status: 'running' as const,
    icon: 'chat',
  },
  {
    id: 4,
    time: '03:00 PM',
    date: 'Today',
    title: 'Shipment Status Check — Container #MSKU7729',
    description: 'Auto-ping carrier API for status update',
    type: 'logistics' as const,
    status: 'scheduled' as const,
    icon: 'local_shipping',
  },
  {
    id: 5,
    time: '05:00 PM',
    date: 'Today',
    title: 'Daily Deal Summary Report',
    description: 'AI-generated report to 3 stakeholders via email',
    type: 'report' as const,
    status: 'scheduled' as const,
    icon: 'summarize',
  },
  {
    id: 6,
    time: '09:00 AM',
    date: 'Tomorrow',
    title: 'Compliance Document Expiry Alert',
    description: 'Auto-alert for ISO 9001 renewal deadline',
    type: 'alert' as const,
    status: 'scheduled' as const,
    icon: 'notifications_active',
  },
];

const scheduledJobs = [
  { name: 'Invoice Generation', frequency: 'On Deal Accept', nextRun: 'On trigger', active: true },
  { name: 'Lead Nurturing Drip', frequency: 'Every 48h', nextRun: 'In 6h', active: true },
  { name: 'Shipment Tracking Sync', frequency: 'Every 4h', nextRun: 'In 45min', active: true },
  { name: 'Market Price Scraper', frequency: 'Daily at 6 AM', nextRun: 'Tomorrow 6 AM', active: false },
  { name: 'Database Backup', frequency: 'Weekly (Sunday)', nextRun: 'Apr 14', active: true },
];

export default function TimelinePage() {
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'list'>('timeline');

  return (
    <DashboardLayout title="Automation Timeline" searchPlaceholder="Search scheduled events...">


      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Workflow Scheduler</span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">Automation Timeline</h1>
            <p className="text-on-surface-variant text-sm mt-1">Chronological view of all automated executions &amp; scheduled tasks.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-primary text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined notranslate text-base" translate="no">add_alarm</span>
              Schedule Task
            </button>
            <div className="bg-orange-50 rounded-full p-1 flex">
              {(['timeline', 'calendar', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-colors ${viewMode === v ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Today', value: '6', sub: 'Automations', color: 'text-primary' },
            { label: 'Completed', value: '2', sub: 'Tasks', color: 'text-green-600' },
            { label: 'Running', value: '1', sub: 'Active', color: 'text-blue-600' },
            { label: 'Scheduled', value: '3', sub: 'Upcoming', color: 'text-amber-600' },
            { label: 'Failed', value: '0', sub: 'Errors', color: 'text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-outline-variant text-center hover:shadow-sm transition-shadow">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-on-surface-variant">{stat.sub}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timeline View (Main) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Day divider */}
            <div className="flex items-center gap-3">
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Today — Apr 9</span>
              <div className="flex-1 h-px bg-outline-variant/30"></div>
            </div>

            {/* Timeline Items */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 w-px h-full bg-outline-variant/30"></div>

              <div className="space-y-6">
                {timelineEvents.map((event) => {
                  const statusConfig = {
                    completed: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-700', label: 'Completed' },
                    running: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700', label: 'Running' },
                    scheduled: { bg: 'bg-orange-50/50', border: 'border-orange-100', dot: 'bg-orange-400', text: 'text-orange-700', label: 'Scheduled' },
                  };
                  const config = statusConfig[event.status];

                  return (
                    <div key={event.id} className="relative flex gap-5 group">
                      {/* Timeline dot */}
                      <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        event.status === 'completed' ? 'bg-green-100 text-green-600' :
                        event.status === 'running' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-50 text-primary'
                      }`}>
                        <span className="material-symbols-outlined notranslate text-lg" translate="no">{event.icon}</span>
                      </div>

                      {/* Card */}
                      <div className={`flex-1 ${config.bg} border ${config.border} rounded-2xl p-5 hover:shadow-md transition-all group-hover:translate-x-1`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-on-surface">{event.title}</h4>
                            <p className="text-xs text-on-surface-variant mt-1">{event.description}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-on-surface-variant">{event.time}</span>
                            <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${event.status === 'running' ? 'animate-pulse' : ''}`}></span>
                              {config.label}
                            </span>
                          </div>
                        </div>
                        {event.status === 'running' && (
                          <div className="mt-3 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tomorrow Divider */}
            <div className="flex items-center gap-3 pt-4">
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Tomorrow — Apr 10</span>
              <div className="flex-1 h-px bg-outline-variant/30"></div>
            </div>
          </div>

          {/* Right Panel */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Scheduled Recurring Jobs */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold font-headline text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary text-lg" translate="no">schedule</span>
                  Recurring Jobs
                </h3>
                <button className="text-primary text-[10px] font-bold underline">Manage</button>
              </div>
              <div className="space-y-4">
                {scheduledJobs.map((job) => (
                  <div key={job.name} className="flex items-start gap-3 group">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${job.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{job.name}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-on-surface-variant">{job.frequency}</span>
                        <span className="text-[10px] font-bold text-primary">{job.nextRun}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Log Summary */}
            <div className="p-[1px] rounded-3xl" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9500)' }}>
              <div className="bg-white rounded-[23px] p-6">
                <h3 className="font-bold font-headline text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary text-lg" translate="no">bar_chart</span>
                  7-Day Execution Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Runs', value: '248' },
                    { label: 'Avg. Duration', value: '3.2s' },
                    { label: 'Success Rate', value: '99.2%' },
                    { label: 'Time Saved', value: '42h' },
                  ].map((m) => (
                    <div key={m.label} className="bg-orange-50/50 p-3 rounded-xl">
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase">{m.label}</p>
                      <p className="text-lg font-black text-on-surface mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Schedule */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
              <h3 className="font-bold font-headline text-sm mb-4">Quick Schedule</h3>
              <div className="space-y-2">
                <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no">bolt</span>
                  Run Selected Now
                </button>
                <button className="w-full py-3 bg-white border border-outline-variant rounded-xl font-bold text-sm text-on-surface hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no">pause</span>
                  Pause All Scheduled
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
}
