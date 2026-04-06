'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { useState } from 'react';

export default function DealsWorkflowPage() {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Import Electronics',
      status: 'In Progress',
      steps: [
        { name: 'Initial Contact', completed: true },
        { name: 'Quote Negotiation', completed: true },
        { name: 'Document Verification', completed: true },
        { name: 'Payment Terms', completed: false },
        { name: 'Shipment Arrangement', completed: false },
      ],
      progress: 60,
    },
    {
      id: 2,
      name: 'Export Textiles',
      status: 'In Progress',
      steps: [
        { name: 'Requirement Posting', completed: true },
        { name: 'Supplier Matching', completed: true },
        { name: 'Sample Approval', completed: false },
        { name: 'Order Placement', completed: false },
        { name: 'Quality Check', completed: false },
      ],
      progress: 40,
    },
    {
      id: 3,
      name: 'Industrial Materials',
      status: 'Completed',
      steps: [
        { name: 'Initial Contact', completed: true },
        { name: 'Negotiation', completed: true },
        { name: 'Documentation', completed: true },
        { name: 'Payment', completed: true },
        { name: 'Delivery', completed: true },
      ],
      progress: 100,
    },
  ]);

  return (
    <DashboardLayout>
      <TopHeader searchPlaceholder="Search workflows..." />
      
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              Deal Workflows
            </h1>
            <p className="text-on-surface-variant">
              Track and manage your deal execution workflows
            </p>
          </div>
          <button className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container transition-colors text-sm">
            + New Workflow
          </button>
        </div>

        {/* Workflows List */}
        <div className="space-y-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-xl border border-outline-variant p-6 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-headline font-black text-on-surface">
                    {workflow.name}
                  </h3>
                  <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${
                    workflow.status === 'Completed' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <span className="text-2xl font-headline font-black text-primary">
                  {workflow.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-outline-variant rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${workflow.progress}%` }}
                />
              </div>

              {/* Steps Timeline */}
              <div className="space-y-3">
                {workflow.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? 'bg-green-600'
                        : 'bg-outline-variant'
                    }`}>
                      {step.completed ? (
                        <span className="text-white text-xs font-bold">✓</span>
                      ) : (
                        <span className="text-xs font-bold text-on-surface-variant">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-headline font-bold ${
                      step.completed
                        ? 'text-on-surface-variant line-through'
                        : 'text-on-surface'
                    }`}>
                      {step.name}
                    </span>
                    {step.completed && (
                      <span className="material-symbols-outlined text-xs text-green-600 ml-auto">
                        check_circle
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-outline-variant flex gap-3">
                <button className="px-4 py-2 text-primary font-headline font-bold hover:bg-primary/10 rounded-lg transition-colors text-sm">
                  View Details
                </button>
                <button className="px-4 py-2 text-primary font-headline font-bold hover:bg-primary/10 rounded-lg transition-colors text-sm">
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
