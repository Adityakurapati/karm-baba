"use client";

import React, { useEffect, useState } from "react";
import { database, auth } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { User } from "@/lib/types";
import toast from "react-hot-toast";

// Use a secondary Firebase app to create users without logging out the admin
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getSecondaryAuth() {
  const apps = getApps();
  const secondaryApp = apps.find(app => app.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
  return getAuth(secondaryApp);
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Lead Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    category: "",
    specialization: ""
  });

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .filter((user: User) => user.role === 'lead') as User[];
        
        usersArray.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLeads(usersArray);
      } else {
        setLeads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const secondaryAuth = getSecondaryAuth();
      // Create user account on secondary auth instance
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // Ensure we sign out the secondary instance to clean up
      await signOut(secondaryAuth);

      // Create Lead record in RTDB
      const leadData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: 'lead',
        category: formData.category,
        specialization: formData.specialization,
        phone: "",
        credibilityScore: 100, // Starts with max trust
        verificationStatus: 'verified', // Admin created leads are pre-verified
        riskLevel: 'low',
        isOnboarded: true,
        company: { id: '', name: 'Independent Agent', registrationNumber: '', industry: formData.category, location: '', employees: 1, yearEstablished: new Date().getFullYear() },
        verificationBadges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await set(ref(database, `users/${uid}`), leadData);
      
      toast.success("Lead created successfully!");
      setIsAddModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "", category: "", specialization: "" });
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.message || "Failed to create lead");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchTerm.toLowerCase();
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const cat = (lead.category || '').toLowerCase();
    return fullName.includes(search) || email.includes(search) || cat.includes(search);
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Lead Management</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Create and manage curated platform leads and RM agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" translate="no">search</span>
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border border-outline-variant/30 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm w-72 text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-headline text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined notranslate text-lg" translate="no">person_add</span>
            Add Lead
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-xl w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline">Create New Lead</h3>
                <p className="text-sm text-on-surface-variant font-medium">Set credentials and assign specialization.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined notranslate text-xl" translate="no">close</span>
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="lead@karmbaba.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Initial Password</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength={6} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Set a strong password..." />
                <p className="text-[10px] text-on-surface-variant mt-1">Lead will use these credentials to log in.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="" disabled>Select Category</option>
                    <option value="Technology">Technology</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Specialization</label>
                  <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. B2B Sales, Mergers..." />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="px-8 py-2.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                  {isCreating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold text-on-surface-variant">Syncing Leads from Database...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          <span className="material-symbols-outlined notranslate text-6xl text-on-surface-variant opacity-30 mb-4" translate="no">person_off</span>
          <p className="font-bold text-xl font-headline">No Leads Found</p>
          <p className="text-on-surface-variant mt-2 text-sm">Create your first lead to assign them to buyers and sellers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              {/* Category Ribbon */}
              <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                {lead.category || 'General'}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/5 border border-primary/20 text-primary flex items-center justify-center text-2xl font-black font-headline shadow-inner">
                  {lead.firstName?.charAt(0)?.toUpperCase() || 'L'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">{lead.firstName} {lead.lastName}</h3>
                  <p className="text-xs font-medium text-on-surface-variant mt-0.5">{lead.specialization || 'Lead Agent'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">mail</span>
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">calendar_today</span>
                  <span>Joined {new Date(lead.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <span className="material-symbols-outlined notranslate text-sm" translate="no">verified</span> Verified
                </div>
                <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Manage <span className="material-symbols-outlined notranslate text-sm" translate="no">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
