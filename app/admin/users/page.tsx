"use client";

import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as User[];
        // Sort by updatedAt or createdAt descending
        usersArray.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getRiskBadge = (level?: string) => {
    switch(level) {
      case 'high': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-error-container text-on-error-container rounded-full shadow-sm">High Risk</span>;
      case 'medium': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-800 rounded-full shadow-sm">Medium Risk</span>;
      case 'low': return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-800 rounded-full shadow-sm">Low Risk</span>;
      default: return <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-800 rounded-full shadow-sm">Unknown</span>;
    }
  };

  const getVerificationBadge = (status?: string, isGstVerified?: boolean) => {
    if (status === 'verified' || isGstVerified) return <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><span className="material-symbols-outlined notranslate text-sm" translate="no">verified</span> Verified</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 text-orange-500 font-bold text-xs"><span className="material-symbols-outlined notranslate text-sm" translate="no">pending</span> Pending</span>;
    return <span className="flex items-center gap-1 text-slate-500 font-bold text-xs"><span className="material-symbols-outlined notranslate text-sm" translate="no">cancel</span> Unverified</span>;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">User Directory</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Real-time portfolio intelligence and user management.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" translate="no">search</span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border border-outline-variant/30 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm w-72 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="text-lg font-bold font-headline">Registered Accounts</h3>
          <span className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 text-xs rounded-full">{filteredUsers.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role / Onboarding</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Verification</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Credibility & Risk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                    <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold font-headline">Synchronizing Database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined notranslate text-4xl mb-2 opacity-50" translate="no">search_off</span>
                    <p className="font-bold font-headline">No users found.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer">
                    {/* User Details */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black font-headline shrink-0 shadow-sm border border-primary/20">
                          {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-extrabold text-on-surface text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Joined {new Date(user.createdAt || user.updatedAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-5">
                      <div className="text-sm">
                        <p className="text-on-surface font-bold">{user.email}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{user.phone || 'No phone provided'}</p>
                      </div>
                    </td>

                    {/* Role & Onboarding */}
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${user.role === 'buyer' ? 'bg-blue-50 text-blue-700 border-blue-200' : user.role === 'seller' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {user.role || 'Guest'}
                        </span>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">
                          Step {user.onboardingStep || 1} / 6
                        </p>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {getVerificationBadge(user.verificationStatus, !!user.isGstVerified)}
                        {user.isAuthorized && (
                           <span className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-widest mt-1"><span className="material-symbols-outlined notranslate text-xs" translate="no">shield_person</span> Authorized</span>
                        )}
                      </div>
                    </td>

                    {/* Credibility Score & Risk */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-3">
                        <div className="w-32">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Score: {user.credibilityScore || 0}</span>
                          </div>
                          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${(user.credibilityScore || 0) > 80 ? 'bg-green-500' : (user.credibilityScore || 0) > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.max(user.credibilityScore || 0, 0), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          {getRiskBadge(user.riskLevel)}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right relative">
                      <button 
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors group-hover:bg-surface-container"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === user.id ? null : user.id!);
                        }}
                      >
                        <span className="material-symbols-outlined notranslate text-xl" translate="no">more_horiz</span>
                      </button>
                      
                      {activeMenu === user.id && (
                        <div className="absolute right-8 top-12 w-48 bg-surface-container-lowest border border-outline-variant/15 shadow-xl rounded-xl py-2 z-50 animate-fade-in text-left">
                          <button className="w-full px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}>
                            <span className="material-symbols-outlined notranslate text-sm" translate="no">visibility</span> View Profile
                          </button>
                          <button className="w-full px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}>
                            <span className="material-symbols-outlined notranslate text-sm" translate="no">admin_panel_settings</span> Change Role
                          </button>
                          <div className="h-px bg-outline-variant/10 my-1"></div>
                          <button className="w-full px-4 py-2 text-sm font-medium text-error hover:bg-error-container/50 hover:text-error transition-colors flex items-center gap-3" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}>
                            <span className="material-symbols-outlined notranslate text-sm" translate="no">block</span> Suspend User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
