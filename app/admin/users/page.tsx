'use client';

import React, { useEffect, useState } from 'react';
import { ModernCard } from '@/components/ModernCard';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { User } from '@/lib/types';
import { activateUser, blockUser, deleteUser } from '@/lib/services/user-services';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { UserIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Categories modal
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; icon?: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

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
        setUsers(usersList.filter(u => u.status !== 'Deleted' || filter === 'Deleted'));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [filter]);

  useEffect(() => {
    const catRef = ref(database, 'categories');
    const unsubscribe = onValue(catRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setCategories(list);
      } else {
        setCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleActivate = async (userId: string) => {
    if (!user) return;
    try { await activateUser(userId, user.id); } catch (e) { console.error(e); }
  };

  const handleBlock = async (userId: string) => {
    if (!user) return;
    try { await blockUser(userId, user.id); } catch (e) { console.error(e); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try { await deleteUser(userId); setSelectedUser(null); } catch (e) { console.error(e); }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const catRef = push(ref(database, 'categories'));
      await set(catRef, { name: newCategoryName.trim(), icon: newCategoryIcon.trim() || '🏭' });
      setNewCategoryName('');
      setNewCategoryIcon('');
    } catch (e) { console.error(e); }
    setSavingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await remove(ref(database, `categories/${id}`)); } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'All' || u.status === filter;
    const matchesSearch =
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-on-surface">User Management</h1>
            <p className="text-on-surface-variant mt-1">Manage platform users and access</p>
          </div>
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined notranslate text-lg" translate="no">category</span>
            Manage Categories
          </button>
        </div>

        <ModernCard className="p-6">
          {/* Filters */}
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
                    filter === f ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
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
                    <tr
                      key={u.id}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {u.profileImage
                            ? <img src={u.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                            : u.firstName?.[0]}
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
                        <ModernBadge variant={
                          u.status === 'Active' ? 'success' :
                          u.status === 'Blocked' ? 'error' :
                          u.status === 'Pending Approval' ? 'warning' : 'primary'
                        }>
                          {u.status || 'Active'}
                        </ModernBadge>
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
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

      {/* ── User Detail Modal ── */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
              <h2 className="text-lg font-bold font-headline text-on-surface">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shrink-0 overflow-hidden border-2 border-primary/20">
                  {selectedUser.profileImage
                    ? <img src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" />
                    : selectedUser.firstName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-on-surface">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-on-surface-variant">{selectedUser.email}</p>
                  <div className="mt-1">
                    <ModernBadge variant={
                      selectedUser.status === 'Active' ? 'success' :
                      selectedUser.status === 'Blocked' ? 'error' :
                      selectedUser.status === 'Pending Approval' ? 'warning' : 'primary'
                    }>
                      {selectedUser.status || 'Active'}
                    </ModernBadge>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                {[
                  { label: 'Role', value: selectedUser.role?.replace('_', ' ') || '—' },
                  { label: 'Phone', value: (selectedUser as any).phone || (selectedUser as any).mobile || '—' },
                  { label: 'Company', value: (selectedUser as any).company || (selectedUser as any).companyName || '—' },
                  { label: 'Industry', value: (selectedUser as any).industry || (selectedUser as any).sector || '—' },
                  { label: 'Location', value: (selectedUser as any).location || (selectedUser as any).city || '—' },
                  { label: 'GST / PAN', value: (selectedUser as any).gst || (selectedUser as any).pan || '—' },
                  { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'User ID', value: selectedUser.id?.slice(0, 10) + '…' },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-on-surface capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Bio / Description */}
              {((selectedUser as any).bio || (selectedUser as any).description) && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">About</p>
                  <p className="text-sm text-on-surface leading-relaxed bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
                    {(selectedUser as any).bio || (selectedUser as any).description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-between items-center">
              <button
                onClick={() => handleDelete(selectedUser.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Delete User
              </button>
              <div className="flex gap-2">
                {selectedUser.status !== 'Blocked' && (
                  <button
                    onClick={() => { handleBlock(selectedUser.id); setSelectedUser(null); }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Block
                  </button>
                )}
                {selectedUser.status !== 'Active' && (
                  <button
                    onClick={() => { handleActivate(selectedUser.id); setSelectedUser(null); }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Activate
                  </button>
                )}
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold text-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Categories Modal ── */}
      {showCategories && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={() => setShowCategories(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-outline-variant overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface">Manage Categories</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Used as industry sectors in onboarding</p>
              </div>
              <button onClick={() => setShowCategories(false)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Add new */}
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Add New Category</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newCategoryIcon}
                  onChange={e => setNewCategoryIcon(e.target.value)}
                  className="w-20 px-3 py-2 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary text-center"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="Category name..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1 px-3 py-2 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="text-4xl mb-3 block">🏷️</span>
                  <p className="text-sm">No categories yet. Add your first one above.</p>
                </div>
              ) : (
                categories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon || '🏭'}</span>
                      <span className="font-semibold text-on-surface text-sm">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="Delete category"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant text-xs text-on-surface-variant text-center">
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · Changes apply instantly to onboarding
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
