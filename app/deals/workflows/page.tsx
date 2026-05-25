'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

const automationNodes = [
  {
    id: 'trigger-1',
    type: 'trigger' as const,
    icon: 'bolt',
    title: 'New Lead Captured',
    subtitle: 'Via KARM BABA Marketplace',
    color: 'primary',
    outputs: ['condition-1'],
  },
  {
    id: 'condition-1',
    type: 'condition' as const,
    icon: 'rule',
    title: 'Lead Score Check',
    subtitle: 'Score ≥ 75 → High Priority',
    color: 'amber',
    outputs: ['action-1', 'action-2'],
  },
  {
    id: 'action-1',
    type: 'action' as const,
    icon: 'email',
    title: 'Send Welcome Pack',
    subtitle: 'Auto-personalized email sequence',
    color: 'blue',
    outputs: ['action-3'],
  },
  {
    id: 'action-2',
    type: 'action' as const,
    icon: 'person_add',
    title: 'Assign to Sales Rep',
    subtitle: 'Round-robin assignment',
    color: 'green',
    outputs: [],
  },
  {
    id: 'action-3',
    type: 'action' as const,
    icon: 'schedule',
    title: 'Wait 48 Hours',
    subtitle: 'Then check engagement',
    color: 'purple',
    outputs: ['condition-2'],
  },
  {
    id: 'condition-2',
    type: 'condition' as const,
    icon: 'analytics',
    title: 'Email Opened?',
    subtitle: 'Check engagement metrics',
    color: 'amber',
    outputs: [],
  },
];

const workflows = [
  { name: 'New Lead Nurturing', status: 'Active', runs: 1248, success: '94%', lastRun: '2 mins ago' },
  { name: 'Deal Follow-up Sequence', status: 'Active', runs: 856, success: '89%', lastRun: '15 mins ago' },
  { name: 'Supplier Onboarding', status: 'Draft', runs: 0, success: '—', lastRun: 'Never' },
  { name: 'Post-Deal Review', status: 'Paused', runs: 234, success: '91%', lastRun: '2 days ago' },
];

export default function WorkflowsPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <DashboardLayout title="CRM Automation" searchPlaceholder="Search workflows...">


      <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Workflow Automation</span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">CRM Automation Flow</h1>
            <p className="text-on-surface-variant text-sm mt-1">Design, deploy, and monitor intelligent trade workflows.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-primary text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined notranslate text-base" translate="no">add</span>
              New Workflow
            </button>
            <button className="px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 border border-outline-variant text-on-surface hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined notranslate text-base" translate="no">upload</span>
              Import Template
            </button>
          </div>
        </section>

        {/* Visual Flow Builder */}
        <section className="bg-orange-50/30 border border-orange-100 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <div>
              <h2 className="text-xl font-bold font-headline">Flow Builder — New Lead Nurturing</h2>
              <p className="text-on-surface-variant text-sm">Interactive visual automation pipeline</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
              </span>
              <button className="text-primary text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-primary/20 hover:bg-orange-50 transition-colors">
                <span className="material-symbols-outlined notranslate text-sm" translate="no">edit</span> Edit
              </button>
            </div>
          </div>

          {/* Nodes */}
          <div className="flex flex-col items-center gap-4 py-4">
            {automationNodes.map((node, index) => {
              const bgColors: Record<string, string> = {
                primary: 'bg-orange-50 border-primary/30',
                amber: 'bg-amber-50 border-amber-300/30',
                blue: 'bg-blue-50 border-blue-300/30',
                green: 'bg-green-50 border-green-300/30',
                purple: 'bg-purple-50 border-purple-300/30',
              };
              const iconColors: Record<string, string> = {
                primary: 'text-primary bg-primary/10',
                amber: 'text-amber-600 bg-amber-100',
                blue: 'text-blue-600 bg-blue-100',
                green: 'text-green-600 bg-green-100',
                purple: 'text-purple-600 bg-purple-100',
              };
              const isSelected = selectedNode === node.id;
              const isSplit = node.outputs.length > 1;

              return (
                <div key={node.id} className="w-full max-w-2xl flex flex-col items-center">
                  <button
                    onClick={() => setSelectedNode(isSelected ? null : node.id)}
                    className={`w-full max-w-md p-5 rounded-2xl border-2 transition-all ${bgColors[node.color]} ${isSelected ? 'ring-4 ring-primary/20 scale-[1.02] shadow-lg' : 'hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[node.color]}`}>
                        <span className="material-symbols-outlined notranslate" translate="no">{node.icon}</span>
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">
                            {node.type === 'trigger' ? '⚡ Trigger' : node.type === 'condition' ? '🔀 Condition' : '▶ Action'}
                          </span>
                        </div>
                        <h4 className="font-bold text-on-surface">{node.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{node.subtitle}</p>
                      </div>
                      <span className="material-symbols-outlined notranslate text-sm text-slate-400" translate="no">chevron_right</span>
                    </div>
                  </button>

                  {/* Connector */}
                  {index < automationNodes.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      {isSplit ? (
                        <div className="flex items-center gap-16">
                          <div className="flex flex-col items-center">
                            <div className="w-px h-4 bg-green-400"></div>
                            <span className="text-[8px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">YES</span>
                            <div className="w-px h-4 bg-green-400"></div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-px h-4 bg-red-400"></div>
                            <span className="text-[8px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">NO</span>
                            <div className="w-px h-4 bg-red-400"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-px h-6" style={{ background: 'linear-gradient(to bottom, #ff6b35, #ff9500)' }}></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add New Node */}
            <button className="mt-4 w-10 h-10 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center text-primary hover:bg-orange-50 transition-colors group">
              <span className="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform" translate="no">add</span>
            </button>
          </div>
        </section>

        {/* Workflow Directory & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-headline">All Workflows</h3>
              <div className="flex gap-2">
                {['All', 'Active', 'Draft'].map((f, i) => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${i === 0 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
                    <th className="pb-4">Workflow</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 hidden md:table-cell">Total Runs</th>
                    <th className="pb-4 hidden sm:table-cell">Success Rate</th>
                    <th className="pb-4">Last Run</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {workflows.map((wf) => (
                    <tr key={wf.name} className="border-b border-slate-50 hover:bg-orange-50/50 transition-colors group cursor-pointer">
                      <td className="py-4">
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{wf.name}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          wf.status === 'Active' ? 'bg-green-100 text-green-700' :
                          wf.status === 'Paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>{wf.status}</span>
                      </td>
                      <td className="py-4 hidden md:table-cell font-medium text-on-surface-variant">{wf.runs.toLocaleString()}</td>
                      <td className="py-4 hidden sm:table-cell font-bold text-on-surface">{wf.success}</td>
                      <td className="py-4 text-on-surface-variant text-xs">{wf.lastRun}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            {/* Automation Metrics */}
            <div className="p-[1px] rounded-3xl" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9500)' }}>
              <div className="bg-white rounded-[23px] p-6">
                <h3 className="font-bold font-headline text-sm mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary text-lg" translate="no">insights</span>
                  Automation Metrics
                </h3>
                <div className="space-y-5">
                  {[
                    { label: 'Total Automations Run', value: '2,338', icon: 'play_arrow' },
                    { label: 'Avg. Completion Time', value: '4.2 mins', icon: 'timer' },
                    { label: 'Hours Saved (30d)', value: '186h', icon: 'schedule' },
                    { label: 'Error Rate', value: '0.8%', icon: 'bug_report' },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined notranslate text-lg" translate="no">{metric.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{metric.label}</p>
                        <p className="text-lg font-black text-on-surface">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined notranslate text-primary" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-bold font-headline text-sm">AI Suggestions</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Add a <span className="font-bold text-primary">WhatsApp notification</span> after &ldquo;Send Welcome Pack&rdquo; to improve engagement by ~18%.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Reduce wait time from <span className="font-bold">48h to 24h</span> for leads with score &gt; 90 — faster follow-up increases conversion by 30%.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}
