'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ActivityLog } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<(ActivityLog & { userEmail?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    const logsRef = ref(database, 'activityLogs');
    const usersRef = ref(database, 'users');

    let usersData: Record<string, any> = {};

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        usersData = snapshot.val();
      }
    });

    const unsubLogs = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const logsList = Object.keys(data).map(key => {
          const l = data[key];
          return {
            ...l,
            id: key,
            timestamp: new Date(l.timestamp),
            userEmail: usersData[l.userId]?.email || l.userId
          };
        }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setLogs(logsList);
      } else {
        setLogs([]);
      }
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  const uniqueActions = ['All', ...Array.from(new Set(logs.map(l => l.action)))];

  const filteredLogs = logs.filter(l => {
    const matchesFilter = actionFilter === 'All' || l.action === actionFilter;
    const searchString = `${l.userEmail} ${l.description} ${l.entityType} ${l.action}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Activity Logs</h1>
                <p className="text-on-surface-variant mt-1">Audit trail for platform events</p>
              </div>
            </div>

            <ModernCard className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-outline-variant pb-6">
                <div className="relative w-full md:w-96">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-sm font-bold text-on-surface-variant">Action:</span>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="flex-1 md:w-auto bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none max-w-[200px]"
                  >
                    {uniqueActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="relative">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockIcon className="w-12 h-12 mx-auto text-on-surface-variant opacity-50 mb-3" />
                      <p className="text-on-surface-variant font-medium">No activity logs found matching your criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLogs.map(log => (
                        <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant">
                          <div className="mt-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <ClockIcon className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                              <p className="font-bold text-on-surface text-sm">
                                {log.userEmail} <span className="text-on-surface-variant font-normal">performed</span> {log.action}
                              </p>
                              <span className="text-xs text-on-surface-variant whitespace-nowrap bg-surface-container-high px-2 py-1 rounded">
                                {log.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface-variant mb-2">{log.description}</p>
                            <div className="flex gap-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-secondary/10 text-secondary-dark">
                                Type: {log.entityType}
                              </span>
                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant truncate max-w-[200px]">
                                ID: {log.entityId}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
