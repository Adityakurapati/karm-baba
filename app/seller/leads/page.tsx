"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { database } from "@/lib/firebase";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { PlatformLead } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function SellerLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<PlatformLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [connections, setConnections] = useState<Record<string, 'pending' | 'approved'>>({});
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const leadsRef = ref(database, 'leads');
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const leadsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PlatformLead[];

        // Filter based on assignment logic
        const visibleLeads = leadsArray.filter(lead => {
          if (lead.assignmentType === 'all') return true;
          
          if (lead.assignmentType === 'users') {
            return lead.assignedUsers?.includes(user.id);
          }
          
          if (lead.assignmentType === 'categories') {
            const userCategories = Array.isArray(user.category) 
              ? user.category 
              : user.category ? [user.category] : [];
            const userIndustry = Array.isArray(user.company?.industry)
              ? user.company?.industry
              : user.company?.industry ? [user?.company?.industry] : [];
            
            // If the lead is assigned to ANY category the user has selected
            return lead.assignedCategories?.some(cat => 
              userCategories.includes(cat) || userIndustry.includes(cat)
            );
          }
          
          return false;
        });
        
        visibleLeads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLeads(visibleLeads);
      } else {
        setLeads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch connections
  useEffect(() => {
    if (!user) return;
    const connectionsRef = ref(database, 'lead_connections');
    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userConnections: Record<string, 'pending' | 'approved'> = {};
        Object.keys(data).forEach(key => {
          if (key.endsWith(`_${user.id}`)) {
            const leadId = key.split('_')[0];
            userConnections[leadId] = data[key].status;
          }
        });
        setConnections(userConnections);
      } else {
        setConnections({});
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleConnect = async (leadId: string) => {
    const status = connections[leadId];
    if (status === 'approved') {
      router.push(`/messages?tab=leads&leadId=${leadId}`);
    } else if (!status) {
      setRequestingId(leadId);
      try {
        const threadId = `${leadId}_${user?.id}`;
        await set(ref(database, `lead_connections/${threadId}`), {
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error(e);
      } finally {
        setRequestingId(null);
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchTerm.toLowerCase();
    const name = (lead.name || '').toLowerCase();
    const company = (lead.companyName || '').toLowerCase();
    return name.includes(search) || company.includes(search);
  });

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          {/* Header */}
          <div className="mb-10 animate-slide-in-down flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-headline font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary mb-3">
                Industry Leads
              </h1>
              <p className="text-lg text-on-surface-variant font-medium">
                Connect with verified agents and category specialists curated for you.
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <span className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" translate="no">search</span>
              <input 
                type="text" 
                placeholder="Search by name, company..." 
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
              <p className="font-bold text-xl text-on-surface-variant font-headline animate-pulse">Loading Curated Network...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-16 text-center border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined notranslate text-6xl text-on-surface-variant opacity-30 mb-6 block" translate="no">person_search</span>
              <h3 className="text-2xl font-bold font-headline mb-2">No Leads Found</h3>
              <p className="text-on-surface-variant text-lg">We couldn't find any leads assigned to your profile matching your criteria. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in-up">
              {filteredLeads.map((lead, idx) => (
                <div key={lead.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 shadow-soft hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden" style={{ animationDelay: `${idx * 50}ms` }}>
                  
                  {/* Top Ribbon */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl font-black font-headline shadow-inner">
                      {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold font-headline text-xl text-on-surface mb-1 group-hover:text-primary transition-colors">{lead.name}</h3>
                    <p className="text-sm font-medium text-primary">{lead.companyName}</p>
                  </div>

                  <div className="space-y-3 mb-8 pb-6 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined notranslate text-[18px] opacity-70" translate="no">phone</span>
                      <span className="font-medium text-on-surface">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined notranslate text-[18px] opacity-70" translate="no">verified</span>
                      <span className="font-medium text-green-600">Verified Partner</span>
                    </div>
                  </div>

                  {(() => {
                    const status = connections[lead.id];
                    if (status === 'approved') {
                      return (
                        <button 
                          onClick={() => handleConnect(lead.id)}
                          className="w-full py-3 rounded-xl font-bold font-headline text-sm bg-primary text-white hover:bg-primary-dark transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group/btn"
                        >
                          <span className="material-symbols-outlined notranslate text-[18px] group-hover/btn:scale-110 transition-transform" translate="no">chat</span>
                          Message Lead
                        </button>
                      );
                    } else if (status === 'pending') {
                      return (
                        <button 
                          disabled
                          className="w-full py-3 rounded-xl font-bold font-headline text-sm bg-surface-container text-on-surface-variant transition-all duration-300 shadow-sm flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined notranslate text-[18px]" translate="no">schedule</span>
                          Connection Pending
                        </button>
                      );
                    } else {
                      return (
                        <button 
                          onClick={() => handleConnect(lead.id)}
                          disabled={requestingId === lead.id}
                          className="w-full py-3 rounded-xl font-bold font-headline text-sm bg-surface-container-low text-on-surface hover:bg-primary hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-wait"
                        >
                          {requestingId === lead.id ? (
                            <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Requesting...</>
                          ) : (
                            <>
                              <span className="material-symbols-outlined notranslate text-[18px] group-hover/btn:scale-110 transition-transform" translate="no">handshake</span>
                              Request Connection
                            </>
                          )}
                        </button>
                      );
                    }
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
