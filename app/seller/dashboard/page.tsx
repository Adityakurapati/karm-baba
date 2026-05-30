'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { ModernBadge } from '@/components/ModernBadge';
import { PlatformLead } from '@/lib/types';

export default function SellerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Data state
  const [deals, setDeals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [usersMap, setUsersMap] = useState<Record<string, {name: string, company: string}>>({});
  const [loading, setLoading] = useState(true);

  // Fetch all seller-related data in real time
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Sales Deals
    const dealsRef = ref(database, 'deals');
    const qDeals = query(dealsRef, orderByChild('sellerId'), equalTo(user.id));
    const unsubscribeDeals = onValue(qDeals, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setDeals(list);
      } else {
        setDeals([]);
      }
    }, (error) => {
      console.error("Error fetching deals:", error);
    });

    // 2. Fetch Seller Products
    const productsRef = ref(database, 'products');
    const qProducts = query(productsRef, orderByChild('sellerId'), equalTo(user.id));
    const unsubscribeProducts = onValue(qProducts, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.values(data));
      } else {
        setProducts([]);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
    });

    // 3. Fetch Platform Leads
    const leadsRef = ref(database, 'leads');
    const unsubscribeLeads = onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const leadsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PlatformLead[];

        // Filter based on assignment logic (similar to app/seller/leads/page.tsx)
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
            
            return lead.assignedCategories?.some(cat => 
              userCategories.includes(cat) || userIndustry.includes(cat)
            );
          }
          
          return false;
        });

        visibleLeads.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLeads(visibleLeads);
      } else {
        setLeads([]);
      }
    }, (error) => {
      console.error("Error fetching leads:", error);
    });

    // 4. Fetch Connections
    const connectionsRef = ref(database, 'lead_connections');
    const unsubscribeConnections = onValue(connectionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userConnections: Record<string, string> = {};
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
      setLoading(false);
    }, (error) => {
      console.error("Error fetching lead connections:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeDeals();
      unsubscribeProducts();
      unsubscribeLeads();
      unsubscribeConnections();
    };
  }, [user]);

  // Fetch users for mapping IDs to names
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const map: Record<string, {name: string, company: string}> = {};
        Object.keys(data).forEach(key => {
          const u = data[key];
          map[key] = {
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
            company: u.company?.name || 'Unknown Company'
          };
        });
        setUsersMap(map);
      }
    });
    return () => unsubscribe();
  }, []);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="font-bold text-xl text-on-surface-variant font-headline">Loading Seller Insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  // Calculate metrics
  const activeDeals = deals.filter(d => !['finalized', 'cancelled'].includes(d.status));
  const finalizedDeals = deals.filter(d => d.status === 'finalized');
  const totalSalesValue = finalizedDeals.reduce((sum, d) => sum + (d.expectedValue || 0), 0);
  const pendingConnections = Object.values(connections).filter(status => status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_supplier':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quote_received':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'negotiation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'sample_requested':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalized':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout title="Sales Dashboard">
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background via-surface-container-low to-background">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 animate-slide-in-down">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Seller Portal</span>
              <h1 className="text-3xl md:text-4xl font-headline font-black text-on-surface tracking-tight">
                Welcome Back, {user.firstName || 'Partner'}
              </h1>
              <p className="text-on-surface-variant font-medium mt-1">
                Monitor your sales metrics, active pipelines, and catalog items.
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/seller/products/new" 
                className="text-white px-5 py-3 rounded-xl font-headline text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 bg-primary hover:bg-primary-dark"
              >
                <span className="material-symbols-outlined notranslate text-base" translate="no">add_box</span>
                Add Product
              </Link>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in-up">
            {[
              {
                label: 'Active Deals',
                value: activeDeals.length.toString(),
                description: 'Deals in negotiation',
                icon: 'handshake',
                color: 'text-blue-600 bg-blue-50 border-blue-100',
              },
              {
                label: 'Pending Connections',
                value: pendingConnections.toString(),
                description: 'Awaiting buyer response',
                icon: 'contact_mail',
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
              {
                label: 'Total Realized Sales',
                value: `${user.company?.gstin ? '₹' : '$'}${totalSalesValue.toLocaleString()}`,
                description: 'From finalized agreements',
                icon: 'payments',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              },
              {
                label: 'Products Listed',
                value: products.length.toString(),
                description: 'Active items in marketplace',
                icon: 'inventory_2',
                color: 'text-purple-600 bg-purple-50 border-purple-100',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-outline-variant/15 hover:border-primary hover:shadow-md transition-all duration-300 flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-3xl font-headline font-black text-on-surface mb-1">{card.value}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{card.description}</p>
                </div>
                <span className={`material-symbols-outlined notranslate p-3.5 rounded-xl border text-2xl ${card.color}`} translate="no">
                  {card.icon}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Left/Center Column: Recent Deals & Pipeline */}
            <div className="col-span-12 lg:col-span-8 space-y-8 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
              
              {/* Sales Deals Pipeline Overview */}
              <section className="bg-white border border-outline-variant/10 rounded-3xl p-6 md:p-8 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-headline text-xl font-black text-on-surface">Recent Sales Agreements</h3>
                    <p className="text-on-surface-variant text-sm mt-1">Manage negotiation processes and active pipeline steps.</p>
                  </div>
                  <Link href="/seller/deals" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                    View All Deals
                    <span className="material-symbols-outlined notranslate text-xs font-black" translate="no">arrow_forward</span>
                  </Link>
                </div>

                {deals.length === 0 ? (
                  <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined notranslate text-5xl text-on-surface-variant opacity-25 mb-3" translate="no">handshake</span>
                    <p className="text-on-surface-variant font-bold text-lg mb-4">No deals negotiated yet</p>
                    <Link
                      href="/seller/leads"
                      className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-sm shadow-md shadow-primary/10 inline-block"
                    >
                      Connect with Buyers
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <th className="pb-3 pr-4">Buyer / Org</th>
                          <th className="pb-3 px-4">Deal Title</th>
                          <th className="pb-3 px-4">Value</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {deals.slice(0, 5).map((deal) => {
                          const buyerName = usersMap[deal.buyerId]?.name || 'Loading buyer...';
                          const buyerCompany = usersMap[deal.buyerId]?.company || 'Verified Buyer';

                          return (
                            <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 pr-4">
                                <p className="font-bold text-on-surface leading-tight">{buyerName}</p>
                                <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{buyerCompany}</p>
                              </td>
                              <td className="py-4 px-4 font-semibold text-on-surface-variant truncate max-w-[150px]" title={deal.title}>
                                {deal.title}
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-black text-primary">{deal.currency || '$'}{deal.expectedValue?.toLocaleString()}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(deal.status)}`}>
                                  {getStatusText(deal.status)}
                                </span>
                              </td>
                              <td className="py-4 pl-4 text-right">
                                <Link 
                                  href={`/deals/${deal.id}`}
                                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-xs transition-colors inline-block"
                                >
                                  Deal Room
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Quick Actions Panel */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'New Product Listing',
                    desc: 'Publish products for buyers to find.',
                    btnText: 'List Product',
                    href: '/seller/products/new',
                    icon: 'add_circle',
                  },
                  {
                    title: 'Search Buyer Leads',
                    desc: 'Explore active buyer demands.',
                    btnText: 'Find Leads',
                    href: '/seller/leads',
                    icon: 'person_search',
                  },
                  {
                    title: 'Catalog Inventory',
                    desc: 'Manage your pricing and availability.',
                    btnText: 'Go to Catalog',
                    href: '/seller/products',
                    icon: 'inventory_2',
                  }
                ].map((act, i) => (
                  <div key={i} className="bg-orange-50/20 border border-orange-100/50 p-6 rounded-3xl flex flex-col justify-between hover:shadow-soft transition-all duration-300 group hover:-translate-y-0.5">
                    <div>
                      <span className="material-symbols-outlined notranslate text-primary text-3xl mb-3 block" translate="no">{act.icon}</span>
                      <h4 className="font-headline font-bold text-base text-on-surface mb-1">{act.title}</h4>
                      <p className="text-xs text-on-surface-variant mb-6 font-medium leading-relaxed">{act.desc}</p>
                    </div>
                    <Link
                      href={act.href}
                      className="px-4 py-2 bg-white hover:bg-primary hover:text-white border border-outline-variant/30 text-on-surface font-bold text-xs rounded-lg shadow-sm transition-all text-center inline-block"
                    >
                      {act.btnText}
                    </Link>
                  </div>
                ))}
              </section>
            </div>

            {/* Right Panel: Smart Intel & Leads */}
            <aside className="col-span-12 lg:col-span-4 space-y-8 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              
              {/* Intel Alerts */}
              <section className="bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined translate-y-[1px] text-primary" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <h3 className="font-headline text-xs font-black uppercase tracking-widest text-slate-500">Sales Intelligence</h3>
                </div>

                {deals.some(d => d.status === 'quote_received') && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined notranslate text-amber-500 text-lg" translate="no">pending_actions</span>
                      <div>
                        <h4 className="text-xs font-black text-amber-800">Pending Quotes Awaiting Review</h4>
                        <p className="text-[10px] text-amber-700/80 mt-1">You have buyer quotations in review. Enter the Deal Room to advance terms.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">Quick Insights</span>
                  <p className="text-xs font-medium text-on-surface leading-relaxed">
                    Finalized transactions have generated a gross of <span className="text-primary font-black">{user.company?.gstin ? '₹' : '$'}{totalSalesValue.toLocaleString()}</span>. 
                    Adding detailed product specifications will increase buyer inquiries by up to 40%.
                  </p>
                </div>
              </section>

              {/* Active Curated Leads */}
              <section className="bg-white border border-outline-variant/10 rounded-3xl p-6 shadow-soft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-lg font-black text-on-surface">Curated Leads</h3>
                  <Link href="/seller/leads" className="text-primary hover:underline text-xs font-bold">
                    View All
                  </Link>
                </div>

                {leads.length === 0 ? (
                  <p className="text-xs text-on-surface-variant font-medium text-center py-6">No matching industry leads found.</p>
                ) : (
                  <div className="space-y-4">
                    {leads.slice(0, 4).map((lead) => {
                      const connStatus = connections[lead.id];
                      return (
                        <div key={lead.id} className="p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl flex items-center justify-between hover:shadow-soft transition-all">
                          <div className="min-w-0 pr-2">
                            <h4 className="font-bold text-xs text-on-surface truncate" title={lead.name}>{lead.name}</h4>
                            <p className="text-[10px] text-on-surface-variant truncate font-semibold">{lead.companyName}</p>
                          </div>
                          
                          {connStatus === 'approved' ? (
                            <Link 
                              href={`/messages?tab=leads&leadId=${lead.id}`}
                              className="px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined notranslate text-[11px]" translate="no">chat</span>
                              Chat
                            </Link>
                          ) : connStatus === 'pending' ? (
                            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-500 font-bold text-[9px] rounded-lg border border-slate-200">
                              Pending
                            </span>
                          ) : (
                            <Link 
                              href="/seller/leads"
                              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] rounded-lg transition-colors"
                            >
                              Connect
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </aside>

          </div>

        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
