"use client";

import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { PlatformLead, User } from "@/lib/types";
import toast from "react-hot-toast";

const AVAILABLE_CATEGORIES = [
  "Technology",
  "Real Estate",
  "Manufacturing",
  "Finance",
  "Consulting",
  "Pharmacy",
  "Agriculture",
  "Other"
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<PlatformLead[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // New Lead Form State
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    code: "",
    location: "Global",
    assignmentType: "all" as "all" | "users" | "categories",
    assignedUsers: [] as string[],
    assignedCategories: [] as string[]
  });

  useEffect(() => {
    // Fetch Leads
    const leadsRef = ref(database, 'leads');
    const unsubscribeLeads = onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const leadsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PlatformLead[];
        
        leadsArray.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLeads(leadsArray);
      } else {
        setLeads([]);
      }
      setLoading(false);
    });

    // Fetch Users (Buyers and Sellers) for assignment dropdown
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .filter((user: User) => user.role === 'buyer' || user.role === 'seller') as User[];
        setAvailableUsers(usersArray);
      } else {
        setAvailableUsers([]);
      }
    });

    return () => {
      unsubscribeLeads();
      unsubscribeUsers();
    };
  }, []);

  const handleUpdateCode = async (leadId: string, currentCode?: string) => {
    const newCode = prompt("Enter new login code for this lead:", currentCode || "");
    if (newCode !== null) {
      try {
        await update(ref(database, `leads/${leadId}`), { code: newCode });
        toast.success("Login code updated successfully");
      } catch (error: any) {
        toast.error("Failed to update login code");
      }
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingLeadId(null);
    setFormData({
      name: "",
      companyName: "",
      phone: "",
      code: "",
      location: "Global",
      assignmentType: "all",
      assignedUsers: [],
      assignedCategories: []
    });
  };

  const handleEditLead = (lead: PlatformLead) => {
    setEditingLeadId(lead.id);
    setFormData({
      name: lead.name || "",
      companyName: lead.companyName || "",
      phone: lead.phone || "",
      code: lead.code || "",
      location: lead.location || "Global",
      assignmentType: lead.assignmentType || "all",
      assignedUsers: lead.assignedUsers || [],
      assignedCategories: lead.assignedCategories || []
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      try {
        await remove(ref(database, `leads/${leadId}`));
        toast.success("Lead deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting lead:", error);
        toast.error("Failed to delete lead");
      }
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }

    setIsCreating(true);

    try {
      const leadData: any = {
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone,
        code: formData.code,
        location: formData.location,
        assignmentType: formData.assignmentType,
        assignedUsers: formData.assignmentType === 'users' ? formData.assignedUsers : [],
        assignedCategories: formData.assignmentType === 'categories' ? formData.assignedCategories : [],
        updatedAt: new Date().toISOString()
      };

      if (editingLeadId) {
        await update(ref(database, `leads/${editingLeadId}`), leadData);
        toast.success("Lead updated successfully!");
      } else {
        leadData.createdAt = new Date().toISOString();
        const leadsRef = ref(database, 'leads');
        const newLeadRef = push(leadsRef);
        await set(newLeadRef, leadData);
        toast.success("Lead created successfully!");
      }
      
      closeModal();
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast.error(error.message || "Failed to save lead");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCategories: prev.assignedCategories.includes(category)
        ? prev.assignedCategories.filter(c => c !== category)
        : [...prev.assignedCategories, category]
    }));
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchTerm.toLowerCase();
    const name = (lead.name || '').toLowerCase();
    const company = (lead.companyName || '').toLowerCase();
    const phone = (lead.phone || '').toLowerCase();
    
    const matchesSearch = name.includes(search) || company.includes(search) || phone.includes(search);
    const matchesLocation = locationFilter === "All Locations" || lead.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Lead Management</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Create and manage curated platform leads and assign them to users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-4 pr-8 py-3 rounded-full border border-outline-variant/30 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm font-medium"
            >
              <option value="All Locations">All Locations</option>
              <option value="Global">Global</option>
              <option value="USA">USA</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
            </select>
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
          </div>
          <button 
            onClick={() => {
              setEditingLeadId(null);
              setFormData({
                name: "",
                companyName: "",
                phone: "",
                code: "",
                location: "Global",
                assignmentType: "all",
                assignedUsers: [],
                assignedCategories: []
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-headline text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined notranslate text-lg" translate="no">person_add</span>
            Add Lead
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold font-headline">{editingLeadId ? "Edit Lead" : "Create New Lead"}</h3>
                <p className="text-sm text-on-surface-variant font-medium">Enter lead details and configure visibility.</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined notranslate text-xl" translate="no">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10 pb-2">Basic Info</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Company Name</label>
                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Acme Corp" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Mobile Number</label>
                    <input required type="tel" pattern="\d{10}" title="Please enter exactly 10 digits" value={formData.phone} onChange={e => {
                      const numericVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: numericVal});
                    }} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="1234567890" />
                    {formData.phone && formData.phone.length !== 10 && (
                      <p className="text-error text-xs mt-1">Number must be exactly 10 digits</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Login Code</label>
                    <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. 123456" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Location</label>
                    <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                      <option value="Global">Global</option>
                      <option value="USA">USA</option>
                      <option value="China">China</option>
                      <option value="India">India</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10 pb-2">Assignment Rules</h4>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="assignment" value="all" checked={formData.assignmentType === 'all'} onChange={() => setFormData({...formData, assignmentType: 'all'})} className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">All Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="assignment" value="users" checked={formData.assignmentType === 'users'} onChange={() => setFormData({...formData, assignmentType: 'users'})} className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Specific Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="assignment" value="categories" checked={formData.assignmentType === 'categories'} onChange={() => setFormData({...formData, assignmentType: 'categories'})} className="text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">By Category</span>
                  </label>
                </div>

                {/* Conditional Rendering based on Assignment Type */}
                {formData.assignmentType === 'users' && (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {availableUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.assignedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <div>
                          <p className="text-sm font-bold text-on-surface">{user.firstName} {user.lastName} <span className="text-xs font-normal text-on-surface-variant ml-2 uppercase">({user.role})</span></p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </label>
                    ))}
                    {availableUsers.length === 0 && <p className="text-sm text-on-surface-variant p-2">No users found.</p>}
                  </div>
                )}

                {formData.assignmentType === 'categories' && (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant mb-3">Lead will be visible to users who selected these categories during onboarding.</p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_CATEGORIES.map(cat => (
                        <label key={cat} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${formData.assignedCategories.includes(cat) ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'}`}>
                          <input 
                            type="checkbox"
                            checked={formData.assignedCategories.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            className="hidden"
                          />
                          <span className="text-sm font-medium">{cat}</span>
                          {formData.assignedCategories.includes(cat) && <span className="material-symbols-outlined notranslate text-[14px]" translate="no">check</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-full font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || (formData.assignmentType === 'users' && formData.assignedUsers.length === 0) || (formData.assignmentType === 'categories' && formData.assignedCategories.length === 0)} 
                  className="px-8 py-2.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : (editingLeadId ? "Save Changes" : "Save Lead")}
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
          <p className="font-bold text-on-surface-variant">Fetching Leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          <span className="material-symbols-outlined notranslate text-6xl text-on-surface-variant opacity-30 mb-4" translate="no">person_off</span>
          <p className="font-bold text-xl font-headline">No Leads Found</p>
          <p className="text-on-surface-variant mt-2 text-sm">Create your first lead and assign it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              {/* Assignment Ribbon and Actions */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                  lead.assignmentType === 'all' ? 'bg-emerald-100 text-emerald-700' :
                  lead.assignmentType === 'categories' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {lead.assignmentType === 'all' ? 'All Users' :
                   lead.assignmentType === 'categories' ? 'Category Match' :
                   'Specific Users'}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditLead(lead)} className="p-1.5 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface-variant rounded-lg transition-colors" title="Edit Lead">
                    <span className="material-symbols-outlined notranslate text-[16px]" translate="no">edit</span>
                  </button>
                  <button onClick={() => handleDeleteLead(lead.id)} className="p-1.5 bg-surface-container-high hover:bg-error hover:text-white text-on-surface-variant rounded-lg transition-colors" title="Delete Lead">
                    <span className="material-symbols-outlined notranslate text-[16px]" translate="no">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className="w-14 h-14 rounded-full bg-primary/5 border border-primary/20 text-primary flex items-center justify-center text-2xl font-black font-headline shadow-inner shrink-0">
                  {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-on-surface truncate">{lead.name}</h3>
                  <p className="text-xs font-medium text-on-surface-variant mt-0.5 truncate">{lead.companyName}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">phone</span>
                  <span className="truncate">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">calendar_today</span>
                  <span>Added {new Date(lead.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/20 p-2 rounded-lg mt-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">password</span>
                    <span>Code: <strong className="text-on-surface">{lead.code || 'Not Set'}</strong></span>
                  </div>
                  <button onClick={() => handleUpdateCode(lead.id, lead.code)} className="text-xs font-bold text-primary hover:underline">
                    Edit
                  </button>
                </div>
                
                {lead.location && (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined notranslate text-base opacity-70" translate="no">location_on</span>
                    <span>{lead.location}</span>
                  </div>
                )}
                
                {lead.assignmentType === 'categories' && lead.assignedCategories && (
                  <div className="flex items-start gap-2 text-xs text-on-surface-variant mt-2 bg-surface-container-low p-2 rounded-lg">
                    <span className="material-symbols-outlined notranslate text-[14px] mt-0.5" translate="no">category</span>
                    <div className="flex flex-wrap gap-1">
                      {lead.assignedCategories.map(c => (
                        <span key={c} className="bg-surface-container-highest px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {lead.assignmentType === 'users' && lead.assignedUsers && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2 bg-surface-container-low p-2 rounded-lg">
                    <span className="material-symbols-outlined notranslate text-[14px]" translate="no">group</span>
                    <span>Assigned to {lead.assignedUsers.length} user(s)</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
