'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { UserSession } from '@/lib/types';
import { terminateSession } from '@/lib/services/user-services';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<(UserSession & { userEmail?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sessions and join with users to get emails
    const sessionsRef = ref(database, 'userSessions');
    const usersRef = ref(database, 'users');

    let usersData: Record<string, any> = {};

    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        usersData = snapshot.val();
      }
    });

    const unsubSessions = onValue(sessionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sessionsList = Object.keys(data).map(key => {
          const s = data[key];
          return {
            ...s,
            id: key,
            loginTime: new Date(s.loginTime),
            lastActivity: new Date(s.lastActivity),
            expiresAt: new Date(s.expiresAt),
            userEmail: usersData[s.userId]?.email || 'Unknown User'
          };
        }).sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime());
        setSessions(sessionsList);
      } else {
        setSessions([]);
      }
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubSessions();
    };
  }, []);

  const handleTerminate = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;
    try {
      await terminateSession(sessionId);
    } catch (e) {
      console.error(e);
    }
  };

  const isMobile = (userAgent: string) => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  };

  return (
    <DashboardLayout title="Dashboard">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Active Sessions</h1>
                <p className="text-on-surface-variant mt-1">Monitor and manage user login sessions</p>
              </div>
            </div>

            <ModernCard className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-outline-variant text-sm text-on-surface-variant uppercase tracking-wider">
                        <th className="pb-3 font-bold">User</th>
                        <th className="pb-3 font-bold">Device & Location</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Login Time</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {sessions.map((s) => {
                        const mobile = isMobile(s.device);
                        return (
                          <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-4">
                              <p className="font-bold text-on-surface text-sm">{s.userEmail}</p>
                              <p className="text-xs text-on-surface-variant truncate max-w-xs" title={s.id}>{s.id}</p>
                            </td>
                            <td className="py-4">
                              <div className="flex items-start gap-2">
                                {mobile ? <DevicePhoneMobileIcon className="w-5 h-5 text-on-surface-variant mt-0.5" /> : <ComputerDesktopIcon className="w-5 h-5 text-on-surface-variant mt-0.5" />}
                                <div>
                                  <p className="text-sm font-medium text-on-surface truncate max-w-[200px]" title={s.device}>
                                    {s.device.split(' ')[0]} {s.device.split(' ')[1]}
                                  </p>
                                  <p className="text-xs text-on-surface-variant">IP: {s.ipAddress}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              {s.isActive ? (
                                new Date() > s.expiresAt ? (
                                  <ModernBadge variant="error">Expired</ModernBadge>
                                ) : (
                                  <ModernBadge variant="success">Active</ModernBadge>
                                )
                              ) : (
                                <ModernBadge variant="warning">Terminated</ModernBadge>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-on-surface-variant" />
                                <div className="text-sm text-on-surface-variant">
                                  <p>{s.loginTime.toLocaleDateString()}</p>
                                  <p className="text-xs">{s.loginTime.toLocaleTimeString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              {s.isActive && (
                                <button 
                                  onClick={() => handleTerminate(s.id)} 
                                  className="p-2 text-error hover:bg-error/10 rounded-full transition-colors flex items-center gap-1 text-xs font-bold float-right" 
                                  title="Terminate Session"
                                >
                                  <XCircleIcon className="w-5 h-5" /> Terminate
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {sessions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                            No active sessions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </ModernCard>
          </div>
        </div>
      </DashboardLayout>
  );
}
