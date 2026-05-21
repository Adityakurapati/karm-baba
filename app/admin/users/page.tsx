"use client";

import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { User } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    const matchesSearch = fullName.includes(search) || email.includes(search);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleCertification = async (targetUser: User) => {
    try {
      const userRef = ref(database, `users/${targetUser.id}`);
      const newStatus = !targetUser.isKarmBabaCertified;
      await update(userRef, { isKarmBabaCertified: newStatus });
      toast.success(`User ${newStatus ? 'marked as certified' : 'certification revoked'}`);
    } catch (error) {
      console.error("Error updating certification status:", error);
      toast.error("Failed to update certification status");
    }
  };

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
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/20 mr-2">
            <button 
              onClick={() => setRoleFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${roleFilter === "all" ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              All
            </button>
            <button 
              onClick={() => setRoleFilter("buyer")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${roleFilter === "buyer" ? "bg-blue-600 text-white shadow-md" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Buyers
            </button>
            <button 
              onClick={() => setRoleFilter("seller")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${roleFilter === "seller" ? "bg-purple-600 text-white shadow-md" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Sellers
            </button>
          </div>
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
                        {user.isKarmBabaCertified && (
                           <span className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-widest mt-1"><span className="material-symbols-outlined notranslate text-xs" translate="no">workspace_premium</span> KB Certified</span>
                        )}
                        {user.isAuthorized && (
                           <span className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1"><span className="material-symbols-outlined notranslate text-xs" translate="no">shield_person</span> Authorized</span>
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
                    <td className="px-6 py-5 text-right">
                      <button 
                        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full font-bold text-xs transition-colors flex items-center gap-2 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                      >
                        <span className="material-symbols-outlined notranslate text-sm" translate="no">visibility</span> View User
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-extrabold font-headline">User Profile: {selectedUser.firstName} {selectedUser.lastName}</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    handleToggleCertification(selectedUser);
                    setSelectedUser({ ...selectedUser, isKarmBabaCertified: !selectedUser.isKarmBabaCertified });
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-colors ${selectedUser.isKarmBabaCertified ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined notranslate text-[14px]" translate="no">workspace_premium</span>
                  {selectedUser.isKarmBabaCertified ? 'Certified' : 'Mark as Certified'}
                </button>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                  <span className="material-symbols-outlined notranslate" translate="no">close</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
              {/* Basic Details */}
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">User ID</p>
                    <p className="font-mono text-sm break-all">{selectedUser.id}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">Email</p>
                    <p className="font-medium text-sm">{selectedUser.email}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">Phone</p>
                    <p className="font-medium text-sm">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">Role</p>
                    <p className="font-medium text-sm capitalize">{selectedUser.role || 'N/A'}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">Language</p>
                    <p className="font-medium text-sm capitalize">{selectedUser.language || 'en'}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1">Last Updated</p>
                    <p className="font-medium text-sm">{new Date(selectedUser.updatedAt || selectedUser.createdAt || Date.now()).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              {selectedUser.company && (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined notranslate text-lg" translate="no">domain</span>
                    Company Information
                  </h4>
                  <div className="bg-surface-container-low rounded-xl p-5 space-y-4 border border-outline-variant/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Company Name</p>
                        <p className="font-bold text-sm">{selectedUser.company.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Registration Number</p>
                        <p className="font-bold text-sm">{selectedUser.company.registrationNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Industry</p>
                        <p className="font-medium text-sm capitalize">{Array.isArray(selectedUser.company.industry) ? selectedUser.company.industry.join(', ') : selectedUser.company.industry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Location</p>
                        <p className="font-medium text-sm">{selectedUser.company.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Website</p>
                        <p className="font-medium text-sm text-primary underline">{selectedUser.company.website || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Employees</p>
                        <p className="font-medium text-sm">{selectedUser.company.employees || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Year Established</p>
                        <p className="font-medium text-sm">{selectedUser.company.yearEstablished || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Verification */}
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Status & Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-2">Account Status</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.isOnboarded ? (
                         <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-800 rounded border border-green-200">Onboarded</span>
                      ) : (
                         <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-800 rounded border border-slate-200">Step {selectedUser.onboardingStep || 1}/6</span>
                      )}
                      {selectedUser.isAuthorized && (
                         <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 rounded border border-blue-200">Authorized</span>
                      )}
                      {selectedUser.isGstVerified && (
                         <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-800 rounded border border-purple-200">GST Verified</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-2">Risk Assessment</p>
                    <div className="flex items-center gap-3">
                      {getRiskBadge(selectedUser.riskLevel)}
                      <span className="text-sm font-bold text-on-surface-variant">Score: {selectedUser.credibilityScore || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GST Details */}
              {selectedUser.gstDetails ? (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined notranslate text-lg" translate="no">account_balance</span>
                    GST Information
                  </h4>
                  <div className="bg-surface-container-low rounded-xl p-5 space-y-4 border border-outline-variant/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">GSTIN Number</p>
                        <p className="font-bold text-sm tracking-wide">{selectedUser.gstDetails.gstin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">PAN Number</p>
                        <p className="font-bold text-sm tracking-wide">{selectedUser.gstDetails.pan || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-on-surface-variant mb-1">Trade Name</p>
                        <p className="font-bold text-base">{selectedUser.gstDetails.tradeName || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-on-surface-variant mb-1">Legal Name</p>
                        <p className="font-medium text-sm">{selectedUser.gstDetails.legalName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Taxpayer Type</p>
                        <p className="font-medium text-sm">{selectedUser.gstDetails.type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Registration Date</p>
                        <p className="font-medium text-sm">{selectedUser.gstDetails.registrationDate || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-on-surface-variant mb-1">Registered Address</p>
                        <p className="font-medium text-sm leading-relaxed">{selectedUser.gstDetails.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">GST Information</h4>
                  <div className="bg-surface-container-low p-6 rounded-xl text-center border border-dashed border-outline-variant/30">
                    <span className="material-symbols-outlined notranslate text-3xl text-on-surface-variant mb-2 opacity-50" translate="no">domain_disabled</span>
                    <p className="text-sm text-on-surface-variant font-medium">No GST details available for this user.</p>
                  </div>
                </div>
              )}
              
              {/* Raw Data Dump (Collapsible or just small text) */}
              <div>
                <details className="group">
                  <summary className="text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined notranslate text-sm transition-transform group-open:rotate-90" translate="no">chevron_right</span>
                    View Raw Developer Data
                  </summary>
                  <div className="mt-3 bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto">
                    <pre className="text-[10px] text-green-400 font-mono">
                      {JSON.stringify(selectedUser, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>

            </div>
            
            <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors text-sm shadow-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
