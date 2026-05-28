'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { User } from '@/lib/types';
import { activateUser, blockUser, deleteUser } from '@/lib/services/user-services';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { UserIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          createdAt: new Date(data[key].createdAt),
        })) as User[];
        // Filter out soft deleted users unless specifically requested
        setUsers(usersList.filter(u => u.status !== 'Deleted' || filter === 'Deleted'));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  const handleActivate = async (userId: string) => {
    if (!user) return;
    try {
      await activateUser(userId, user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!user) return;
    try {
      await blockUser(userId, user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'All' || u.status === filter;
    const matchesSearch = 
      u.email?.toLowerCase().includes(search.toLowerCase()) || 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
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
                <h1 className="text-3xl font-display font-bold text-on-surface">User Management</h1>
                <p className="text-on-surface-variant mt-1">Manage platform users and access</p>
              </div>
            </div>

            <ModernCard className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  {['All', 'Active', 'Pending Approval', 'Blocked', 'Inactive'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                        filter === f 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant text-sm text-on-surface-variant uppercase tracking-wider">
                        <th className="pb-3 font-bold">User</th>
                        <th className="pb-3 font-bold">Role</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold">Joined</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {u.profileImage ? <img src={u.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : u.firstName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-on-surface-variant">{u.email}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="capitalize font-medium text-sm text-on-surface">{u.role?.replace('_', ' ')}</span>
                          </td>
                          <td className="py-4">
                            <ModernBadge 
                              variant={
                                u.status === 'Active' ? 'success' : 
                                u.status === 'Blocked' ? 'error' : 
                                u.status === 'Pending Approval' ? 'warning' : 'primary'
                              }
                            >
                              {u.status || 'Active'}
                            </ModernBadge>
                          </td>
                          <td className="py-4 text-sm text-on-surface-variant">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {u.status !== 'Active' && (
                              <button onClick={() => handleActivate(u.id)} className="p-2 text-success hover:bg-success/10 rounded-full" title="Activate">
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                            )}
                            {u.status !== 'Blocked' && (
                              <button onClick={() => handleBlock(u.id)} className="p-2 text-warning hover:bg-warning/10 rounded-full" title="Block">
                                <NoSymbolIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(u.id)} className="p-2 text-error hover:bg-error/10 rounded-full" title="Delete">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            No users found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </ModernCard>
          </div>
        </main>
      </div>
    </div>
  );
}
