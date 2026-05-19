"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { User } from "@/lib/types";
import toast from "react-hot-toast";

export default function BuyerLeadsPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const leadsArray = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .filter((user: User) => user.role === 'lead') as User[];
        
        setLeads(leadsArray);
      } else {
        setLeads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConnect = (leadId: string) => {
    setConnectingId(leadId);
    // Simulate connection delay
    setTimeout(() => {
      toast.success("Connection request sent successfully!");
      setConnectingId(null);
    }, 1200);
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchTerm.toLowerCase();
    const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
    const cat = (lead.category || '').toLowerCase();
    const spec = (lead.specialization || '').toLowerCase();
    return fullName.includes(search) || cat.includes(search) || spec.includes(search);
  });

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          {/* Header */}
          <div className="mb-10 animate-slide-in-down flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary mb-3">
                Industry Leads
              </h1>
              <p className="text-lg text-on-surface-variant font-medium">
                Connect with verified agents and category specialists to accelerate your deals.
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" translate="no">search</span>
              <input 
                type="text" 
                placeholder="Search by name, category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-12 pr-4 py-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          {/* Leads Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-bold text-xl text-on-surface-variant font-headline animate-pulse">Loading Lead Network...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-16 text-center border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined notranslate text-6xl text-on-surface-variant opacity-30 mb-6 block" translate="no">person_search</span>
              <h3 className="text-2xl font-bold font-headline mb-2">No Leads Found</h3>
              <p className="text-on-surface-variant text-lg">We couldn't find any leads matching your criteria. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in-up">
              {filteredLeads.map((lead, idx) => (
                <div key={lead.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 shadow-soft hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden" style={{ animationDelay: `${idx * 50}ms` }}>
                  
                  {/* Top Ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl font-black font-headline shadow-inner">
                      {lead.firstName?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                    <div className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {lead.category || 'General'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold font-headline text-xl text-on-surface mb-1 group-hover:text-primary transition-colors">{lead.firstName} {lead.lastName}</h3>
                    <p className="text-sm font-medium text-primary">{lead.specialization || 'Independent Consultant'}</p>
                  </div>

                  <div className="space-y-3 mb-8 pb-6 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined notranslate text-[18px] opacity-70" translate="no">verified</span>
                      <span className="font-medium text-green-600">Verified Platform Agent</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined notranslate text-[18px] opacity-70" translate="no">military_tech</span>
                      <span className="font-medium">Top {lead.credibilityScore || 100}% Credibility</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConnect(lead.id)}
                    disabled={connectingId === lead.id}
                    className="w-full py-3 rounded-xl font-bold font-headline text-sm bg-surface-container-low text-on-surface hover:bg-primary hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-wait"
                  >
                    {connectingId === lead.id ? (
                      <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Connecting...</>
                    ) : (
                      <>
                        <span className="material-symbols-outlined notranslate text-[18px] group-hover/btn:scale-110 transition-transform" translate="no">handshake</span>
                        Connect with Lead
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
