"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { database } from "@/lib/firebase";
import { ref, onValue, update, push, set, serverTimestamp } from "firebase/database";
import { Deal, DealEvent } from "@/lib/types";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NegotiateDealPage({ params }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dealId, setDealId] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [agreedPrice, setAgreedPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [deliveryTerms, setDeliveryTerms] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      const id = resolvedParams.id;
      setDealId(id);

      const dealRef = ref(database, `deals/${id}`);
      const unsubscribe = onValue(dealRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setDeal(data);
          // Initialize form if not modified yet
          if (!agreedPrice) setAgreedPrice(data.agreedPrice || 0);
          if (!quantity) setQuantity(data.quantity || 0);
          if (!deliveryDate) {
             const d = new Date(data.deliveryDate);
             if (!isNaN(d.getTime())) {
                setDeliveryDate(d.toISOString().split('T')[0]);
             }
          }
          if (!paymentTerms) setPaymentTerms(data.paymentTerms || "");
          if (!deliveryTerms) setDeliveryTerms(data.deliveryTerms || "");
        }
        setLoading(false);
      }, (error) => {
        console.error(error);
        toast.error("Failed to load deal.");
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </main>
      </div>
    );
  }

  if (!deal || !user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
          <div className="text-center p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined notranslate text-6xl text-on-surface-variant opacity-30 mb-4" translate="no">error</span>
            <p className="font-bold text-xl mb-2 font-headline">Deal Not Found</p>
            <p className="text-on-surface-variant mb-6">The deal you are trying to negotiate doesn't exist or you don't have access.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md hover:bg-primary-dark transition-colors">Go Home</Link>
          </div>
        </main>
      </div>
    );
  }

  const isMyTurn = deal.status === 'negotiation' || deal.status === 'new_supplier' || deal.status === 'quote_received' || deal.status === 'inquiry';
  const otherPartyId = user.id === deal.buyerId ? deal.sellerId : deal.buyerId;

  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId || !user) return;
    setIsSubmitting(true);

    try {
      const dealRef = ref(database, `deals/${dealId}`);
      
      const newTimelineEvent: DealEvent = {
        id: `event_${Date.now()}`,
        dealId: dealId,
        type: 'offer_made',
        title: `${user.role === 'buyer' ? 'Buyer' : 'Seller'} submitted a counter-offer`,
        description: JSON.stringify({
          agreedPrice,
          quantity,
          deliveryDate,
          paymentTerms,
          deliveryTerms
        }),
        createdBy: user.id,
        createdAt: new Date() as any // Firebase will serialize Date to string if not careful, better to use ISO
      };

      // Ensure timeline array exists
      const updatedTimeline = deal.timeline ? [...deal.timeline, newTimelineEvent] : [newTimelineEvent];

      await update(dealRef, {
        agreedPrice: Number(agreedPrice),
        quantity: Number(quantity),
        deliveryDate: new Date(deliveryDate).toISOString(),
        paymentTerms,
        deliveryTerms,
        status: 'negotiation',
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      });

      // Send Notification
      const notifRef = push(ref(database, 'notifications'));
      await set(notifRef, {
        id: notifRef.key,
        userId: otherPartyId,
        title: 'New Counter Offer',
        message: `${user.firstName} submitted a counter-offer for "${deal.title}".`,
        type: 'general',
        link: `/deals/${dealId}/negotiate`,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success("Counter-offer submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit counter-offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!dealId || !user) return;
    setIsSubmitting(true);

    try {
      const dealRef = ref(database, `deals/${dealId}`);
      
      const newTimelineEvent: DealEvent = {
        id: `event_${Date.now()}`,
        dealId: dealId,
        type: 'offer_accepted',
        title: `Offer Accepted by ${user.role === 'buyer' ? 'Buyer' : 'Seller'}`,
        description: "The current terms of the deal were formally accepted.",
        createdBy: user.id,
        createdAt: new Date() as any
      };

      const updatedTimeline = deal.timeline ? [...deal.timeline, newTimelineEvent] : [newTimelineEvent];

      await update(dealRef, {
        status: 'finalized',
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      });

      // Send Notification
      const notifRef = push(ref(database, 'notifications'));
      await set(notifRef, {
        id: notifRef.key,
        userId: otherPartyId,
        title: 'Offer Accepted! 🎉',
        message: `${user.firstName} accepted the terms for "${deal.title}". The deal is now finalized!`,
        type: 'general',
        link: `/deals/${dealId}`,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success("Offer accepted successfully! Deal finalized.");
      router.push(`/deals/${dealId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineOffers = (deal.timeline || []).filter(e => e.type === 'offer_made');

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
          {/* Header */}
          <header className="bg-white border-b border-outline-variant p-4 md:p-6 flex justify-between items-center shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined notranslate" translate="no">menu</span>
              </button>
              <h1 className="text-xl md:text-2xl font-headline font-black tracking-tight text-on-surface">Deal Negotiation Room</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/deals/${dealId}`} className="px-5 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors hidden sm:block">
                View Deal Overview
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
            <div className="max-w-7xl w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column: Current Terms & Form */}
              <div className="xl:col-span-2 space-y-8 animate-slide-in-up">
                
                {/* Context Header */}
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none" style={{ background: 'linear-gradient(to left, white, transparent)' }}></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded border border-white/30 backdrop-blur-sm">
                        {deal.status.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded border border-white/30 backdrop-blur-sm">
                        {deal.currency}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black font-headline mb-2">{deal.title}</h2>
                    <p className="text-white/80 font-medium mb-6 max-w-2xl">{deal.description || 'No detailed description available.'}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Current Total Value</p>
                        <p className="text-xl font-black">{deal.currency || '$'}{((deal.agreedPrice || deal.expectedValue || 0) * (deal.quantity || 1)).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Quantity</p>
                        <p className="text-xl font-black">{(deal.quantity || 1).toLocaleString()} {deal.unit || 'Units'}</p>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Unit Price</p>
                        <p className="text-xl font-black">{deal.currency || '$'}{(deal.agreedPrice || deal.expectedValue || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Target Delivery</p>
                        <p className="text-xl font-black">{deal.deliveryDate ? new Date(deal.deliveryDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counter Offer Form */}
                <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 shadow-soft relative">
                  {deal.status === 'finalized' && (
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
                       <div className="bg-white p-6 rounded-2xl shadow-xl text-center border border-emerald-100 max-w-sm">
                         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <span className="material-symbols-outlined notranslate text-3xl" translate="no">handshake</span>
                         </div>
                         <h3 className="text-xl font-black font-headline text-emerald-800 mb-2">Deal Finalized</h3>
                         <p className="text-sm text-on-surface-variant">This deal has been successfully concluded. Negotiation is closed.</p>
                       </div>
                     </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant/10">
                    <div>
                      <h3 className="text-2xl font-black font-headline text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined notranslate text-primary" translate="no">edit_document</span>
                        Propose New Terms
                      </h3>
                      <p className="text-on-surface-variant text-sm mt-1">Adjust the parameters below to submit a counter-offer.</p>
                    </div>
                    {deal.status !== 'finalized' && (
                      <button 
                        onClick={handleAcceptOffer}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined notranslate text-xl" translate="no">check_circle</span>
                        Accept Current Terms
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCounterOffer} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price per Unit */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Unit Price ({deal.currency})</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">{deal.currency === 'USD' ? '$' : '₹'}</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            required
                            value={agreedPrice}
                            onChange={(e) => setAgreedPrice(parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                          />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Quantity ({deal.unit})</label>
                        <input 
                          type="number" 
                          min="1"
                          required
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                        />
                      </div>

                      {/* Calculated Total */}
                      <div className="md:col-span-2 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-800">Proposed Total Deal Value:</span>
                        <span className="text-2xl font-black text-blue-900">{deal.currency} {(agreedPrice * quantity).toLocaleString()}</span>
                      </div>

                      {/* Delivery Date */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Expected Delivery Date</label>
                        <input 
                          type="date" 
                          required
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full px-4 py-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>

                      {/* Payment Terms */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Payment Terms</label>
                        <select 
                          required
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="w-full px-4 py-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                        >
                          <option value="100% Advance">100% Advance</option>
                          <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                          <option value="Net 30">Net 30 Days</option>
                          <option value="Net 60">Net 60 Days</option>
                          <option value="Letter of Credit">Letter of Credit</option>
                        </select>
                      </div>

                      {/* Delivery Terms */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Incoterms / Delivery Terms</label>
                        <textarea 
                          rows={2}
                          value={deliveryTerms}
                          onChange={(e) => setDeliveryTerms(e.target.value)}
                          placeholder="e.g., FOB Mumbai, CIF Dubai, etc."
                          className="w-full px-4 py-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-outline-variant/10 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSubmitting || deal.status === 'finalized'}
                        className="px-8 py-4 bg-primary text-white rounded-xl font-bold font-headline text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isSubmitting ? (
                          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                        ) : (
                          <><span className="material-symbols-outlined notranslate" translate="no">send</span> Submit Counter-Offer</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Negotiation History */}
              <div className="xl:col-span-1">
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-6 shadow-sm sticky top-6 h-[calc(100vh-140px)] flex flex-col">
                  <h3 className="text-xl font-black font-headline text-on-surface mb-6 flex items-center gap-2 pb-4 border-b border-outline-variant/10">
                    <span className="material-symbols-outlined notranslate text-primary" translate="no">history</span>
                    Offer History
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    {timelineOffers.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined notranslate text-4xl text-on-surface-variant opacity-20 mb-3" translate="no">inbox</span>
                        <p className="text-on-surface-variant text-sm font-medium">No counter-offers yet. The original terms are currently standing.</p>
                      </div>
                    ) : (
                      timelineOffers.slice().reverse().map((offer, idx) => {
                        let parsedData: any = {};
                        try {
                          parsedData = JSON.parse(offer.description);
                        } catch (e) {
                          // Ignore parse error, maybe it wasn't JSON
                        }

                        const isYou = offer.createdBy === user.id;

                        return (
                          <div key={offer.id} className="relative pl-6 pb-6 border-l-2 border-outline-variant/20 last:border-l-0 last:pb-0">
                            <div className={`absolute top-0 left-[-9px] w-4 h-4 rounded-full border-2 border-white ${isYou ? 'bg-primary' : 'bg-orange-500'} shadow-sm`}></div>
                            
                            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-1 ${isYou ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-700'}`}>
                                    {isYou ? 'You Proposed' : 'They Proposed'}
                                  </span>
                                  <p className="text-xs text-on-surface-variant font-medium">
                                    {new Date(offer.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              
                              {parsedData.agreedPrice !== undefined ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center border-b border-outline-variant/5 pb-1">
                                    <span className="text-on-surface-variant">Price</span>
                                    <span className="font-bold">{deal.currency} {parsedData.agreedPrice.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-outline-variant/5 pb-1">
                                    <span className="text-on-surface-variant">Qty</span>
                                    <span className="font-bold">{parsedData.quantity.toLocaleString()} {deal.unit}</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-outline-variant/5 pb-1">
                                    <span className="text-on-surface-variant">Total</span>
                                    <span className="font-black text-primary">{deal.currency} {(parsedData.agreedPrice * parsedData.quantity).toLocaleString()}</span>
                                  </div>
                                  <div className="pt-1">
                                    <span className="text-xs text-on-surface-variant block mb-0.5">Delivery</span>
                                    <span className="font-medium text-xs">{new Date(parsedData.deliveryDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-on-surface-variant">{offer.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Bottom fade effect */}
                  <div className="absolute bottom-6 left-6 right-6 h-8 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
