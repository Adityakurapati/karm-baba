'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { getBusinessById } from '@/lib/services/business-services';
import { BusinessProfile, BusinessHistory } from '@/lib/types';
import { ref, get, query, orderByChild } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';

export default function BusinessHistoryPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [history, setHistory] = useState<BusinessHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBusinessById(id);
        if (data) {
          setBusiness(data);
        } else {
          setError('Business not found');
          return;
        }

        // Fetch history
        const historyRef = ref(database, `businessHistory/${id}`);
        const snapshot = await get(historyRef);
        
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyList = Object.keys(historyData).map(key => ({
            ...historyData[key],
            id: key,
            timestamp: new Date(historyData[key].timestamp)
          })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          setHistory(historyList);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Audit History</h1>
                <p className="text-on-surface-variant mt-1">
                  Track all modifications made to {business?.businessName || 'this profile'}
                </p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push(`/business/${id}`)}>
                Back to Dashboard
              </ModernButton>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <ModernCard className="p-6 md:p-8">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
                  <p className="text-on-surface-variant font-medium">No history records found.</p>
                  <p className="text-sm text-on-surface-variant mt-1">Updates to the business profile will appear here.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-px bg-outline-variant"></div>
                  
                  <div className="space-y-8 relative">
                    {history.map((log) => (
                      <div key={log.id} className="flex gap-6">
                        {/* Timeline marker */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl p-5 hover:shadow-soft transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-on-surface-variant" />
                              <span className="font-bold text-sm text-on-surface">{log.changedBy}</span>
                              <span className="text-sm text-on-surface-variant">updated</span>
                              <span className="font-bold text-sm text-primary capitalize bg-primary/5 px-2 py-0.5 rounded">
                                {log.fieldName.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                              {log.timestamp.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-stretch gap-4 text-sm mt-4 bg-white rounded-xl border border-outline-variant overflow-hidden">
                            <div className="flex-1 p-3 bg-error/5 border-r border-outline-variant">
                              <p className="text-xs font-bold text-error mb-1 uppercase tracking-wider">Old Value</p>
                              <p className="text-on-surface break-words">{String(log.oldValue) || <span className="text-on-surface-variant italic">Empty</span>}</p>
                            </div>
                            <div className="flex-1 p-3 bg-success/5">
                              <p className="text-xs font-bold text-success mb-1 uppercase tracking-wider">New Value</p>
                              <p className="text-on-surface break-words">{String(log.newValue) || <span className="text-on-surface-variant italic">Empty</span>}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
