'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';

export default function TradeExecutionPage() {
  const trades = [
    { id: 1, from: 'USA', to: 'India', product: 'Electronics', amount: '$250,000', status: 'Executing', progress: 75 },
    { id: 2, from: 'China', to: 'Germany', product: 'Textiles', amount: '$180,000', status: 'Confirmed', progress: 100 },
    { id: 3, from: 'India', to: 'USA', product: 'Chemicals', amount: '$320,000', status: 'Negotiating', progress: 45 },
    { id: 4, from: 'Brazil', to: 'UAE', product: 'Agricultural', amount: '$95,000', status: 'Pending', progress: 20 },
  ];

  return (
    <DashboardLayout searchPlaceholder="Search trades...">

      
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
              Trade Execution
            </h1>
            <p className="text-on-surface-variant">
              Monitor and manage your international trade transactions
            </p>
          </div>
          <button className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container text-sm">
            + New Trade
          </button>
        </div>

        {/* Execution Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {['Pending', 'Negotiating', 'Confirmed', 'Executing'].map((stage, i) => (
            <div key={i} className="bg-white rounded-xl border border-outline-variant p-4 text-center">
              <div className="text-2xl font-headline font-black text-primary mb-1">
                {trades.filter(t => t.status.includes(stage === 'Negotiating' ? 'Negotiating' : stage === 'Confirmed' ? 'Confirmed' : stage === 'Executing' ? 'Executing' : 'Pending')).length}
              </div>
              <p className="text-sm text-on-surface-variant">{stage}</p>
            </div>
          ))}
        </div>

        {/* Trades Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-outline-variant">
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-headline font-bold text-on-surface">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-headline font-bold text-on-surface">
                      {trade.from} → {trade.to}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{trade.product}</td>
                    <td className="px-6 py-4 font-headline font-bold text-primary">{trade.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        trade.status === 'Executing' ? 'bg-blue-100 text-blue-700' :
                        trade.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        trade.status === 'Negotiating' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-outline-variant rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${trade.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">{trade.progress}%</span>
                      </div>
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
