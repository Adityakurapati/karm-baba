'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getRequirementsByBuyerId } from '@/lib/mockData';

export default function RequirementsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const requirements = getRequirementsByBuyerId(user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'matched':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
                My Requirements
              </h1>
              <p className="text-on-surface-variant">
                Manage your procurement needs and find suppliers
              </p>
            </div>
            <Link
              href="/buyer/requirements/new"
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
            >
              + Post Requirement
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search requirements..."
              className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none"
            />
            <select className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none">
              <option>All Status</option>
              <option>Open</option>
              <option>Matched</option>
              <option>Closed</option>
            </select>
          </div>

          {/* Requirements Grid */}
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">No requirements yet</p>
                <Link
                  href="/buyer/requirements/new"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  Post Your First Requirement
                </Link>
              </div>
            ) : (
              requirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-outline-variant p-6 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                        {req.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm mb-3">
                        {req.description}
                      </p>
                      <div className="flex gap-4 flex-wrap mb-3">
                        <div>
                          <p className="text-xs text-on-surface-variant">Quantity</p>
                          <p className="font-bold text-on-surface">
                            {req.quantity} {req.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Budget</p>
                          <p className="font-bold text-on-surface">
                            ${req.budget.toLocaleString()} {req.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Category</p>
                          <p className="font-bold text-on-surface">{req.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">Delivery Date</p>
                          <p className="font-bold text-on-surface">
                            {new Date(req.requiredDeliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${getStatusColor(req.status)}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-outline-variant">
                    <Link
                      href={`/buyer/requirements/${req.id}`}
                      className="flex-1 px-4 py-2 text-center bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                    >
                      View Details
                    </Link>
                    {req.status === 'matched' && (
                      <Link
                        href={`/buyer/matches?req=${req.id}`}
                        className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                      >
                        View Suppliers
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
