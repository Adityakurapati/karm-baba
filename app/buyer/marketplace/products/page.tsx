'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { ModernButton } from '@/components/ModernButton';

export default function BuyerProductMarketplace() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Product Details Modal State
  const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setProducts([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escape key handler to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProductDetail(null);
        setShowPaymentModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConnect = async (product: any) => {
    if (!user) return;
    
    try {
      // Create an inquiry deal to enable messaging
      const dealsRef = ref(database, 'deals');
      const newDealRef = push(dealsRef);
      const dealId = newDealRef.key;

      await set(newDealRef, {
        id: dealId,
        title: `Inquiry: ${product.name}`,
        productId: product.id,
        sellerId: product.sellerId,
        buyerId: user.id,
        status: 'inquiry',
        expectedValue: product.price,
        currency: product.currency || 'USD',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send initial message
      const messageRef = push(ref(database, `messages/${dealId}`));
      await set(messageRef, {
        id: messageRef.key,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: `Hi, I'm interested in your product: ${product.name}. Let's discuss!`,
        createdAt: serverTimestamp(),
      });

      // Notify Seller
      const notifRef = push(ref(database, `notifications`));
      await set(notifRef, {
        id: notifRef.key,
        userId: product.sellerId,
        title: 'New Product Inquiry',
        message: `${user.firstName} is interested in your product: ${product.name}`,
        type: 'product_inquiry',
        link: `/deals/${dealId}`,
        read: false,
        createdAt: serverTimestamp(),
      });
      alert('Inquiry sent! You can now chat with the seller in your Messages.');
    } catch (error) {
      console.error('Error sending inquiry:', error);
    }
  };

  const handleBuyClick = (product: any) => {
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!user || !selectedProduct) return;
    setIsProcessing(true);
    
    try {
      // Create Order
      const orderRef = push(ref(database, 'orders'));
      await set(orderRef, {
        id: orderRef.key,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sellerId: selectedProduct.sellerId,
        buyerId: user.id,
        price: selectedProduct.price,
        currency: selectedProduct.currency,
        status: 'paid',
        createdAt: serverTimestamp(),
      });

      // Notify Seller
      const notifRef = push(ref(database, 'notifications'));
      await set(notifRef, {
        id: notifRef.key,
        userId: selectedProduct.sellerId,
        title: 'Product Purchased!',
        message: `${user.firstName} has purchased your product: ${selectedProduct.name}`,
        type: 'product_sold',
        link: `/seller/deals`,
        read: false,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setSuccess(false);
        setSelectedProduct(null);
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
                  Global Product Marketplace
                </h1>
                <p className="text-on-surface-variant">
                  Source verified products from global manufacturers
                </p>
              </div>
              <div className="flex gap-4">
                <ModernButton variant="outline" size="sm">
                  Filter Category
                </ModernButton>
              </div>
            </div>

            {/* Products Aspect-Square Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-outline-variant shadow-soft">
                  <p className="text-on-surface-variant text-xl">No products available at the moment.</p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-outline-variant hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Image Banner */}
                    <div className="h-[35%] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-500">📦</span>
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-primary shadow-sm">
                        {product.category}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-headline font-bold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-0.5" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant mb-2">by {product.sellerName || 'Verified Seller'}</p>
                        
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Price</span>
                          <span className="text-sm font-headline font-black text-primary">
                            {product.currency || '$'}{product.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="pt-2 border-t border-outline-variant/30 mt-2">
                        <button
                          onClick={() => setSelectedProductDetail(product)}
                          className="w-full px-3 py-2 text-center text-xs bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Beautiful Product Details Modal */}
        {selectedProductDetail && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedProductDetail(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Banner */}
              <div className="h-48 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center relative overflow-hidden border-b border-outline-variant">
                <span className="text-7xl">📦</span>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-white border border-outline-variant/50 rounded-full text-primary shadow-sm">
                    {selectedProductDetail.category}
                  </span>
                  <button
                    onClick={() => setSelectedProductDetail(null)}
                    className="bg-white/80 hover:bg-white text-on-surface-variant hover:text-on-surface p-1.5 rounded-full shadow-sm hover:shadow transition-all"
                    aria-label="Close modal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
                    {selectedProductDetail.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Offered by <span className="font-bold text-on-surface">{selectedProductDetail.sellerName || 'Verified Seller'}</span>
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unit Price</p>
                    <p className="text-2xl font-headline font-black text-primary">
                      {selectedProductDetail.price?.toLocaleString()} {selectedProductDetail.currency || 'USD'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Available Stock</p>
                    <p className="text-lg font-black text-on-surface">
                      {selectedProductDetail.stock} units
                    </p>
                  </div>
                </div>

                {/* Specifications Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Product Specifications</h3>
                  <div className="text-on-surface text-sm whitespace-pre-wrap bg-surface-container-lowest p-4 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedProductDetail.description}
                  </div>
                </div>

                {/* Secure Trust Badges */}
                <div className="flex gap-4 items-center p-3 bg-green-50/50 rounded-xl border border-green-200/50 text-green-800 text-xs">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="font-bold">Verified Global Seller</p>
                    <p className="text-[10px] text-green-700/80">Secured transaction support with safe trade assurance protections.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProductDetail(null);
                    handleConnect(selectedProductDetail);
                  }}
                  className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-bold transition-colors text-sm"
                >
                  Connect
                </button>
                <button
                  onClick={() => {
                    setSelectedProductDetail(null);
                    handleBuyClick(selectedProductDetail);
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors text-sm"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => !isProcessing && setShowPaymentModal(false)}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-in">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined notranslate text-4xl" translate="no">check_circle</span>
                  </div>
                  <h2 className="text-2xl font-headline font-black text-on-surface mb-2">Order Confirmed!</h2>
                  <p className="text-on-surface-variant">Your payment has been processed successfully.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-headline font-black text-on-surface mb-6 text-center">Complete Payment</h2>
                  <div className="bg-surface-container rounded-2xl p-6 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-on-surface-variant">Product</span>
                      <span className="font-bold">{selectedProduct?.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-on-surface-variant">Total Amount</span>
                      <span className="font-bold text-primary">{selectedProduct?.currency} {selectedProduct?.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined notranslate" translate="no">payments</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">KARM BABA Secure Pay</p>
                        <p className="text-xs text-on-surface-variant">Instant bank transfer secured</p>
                      </div>
                      <span className="material-symbols-outlined notranslate text-primary" translate="no">check_circle</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <ModernButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </ModernButton>
                    <ModernButton
                      variant="primary"
                      className="flex-1"
                      onClick={confirmPayment}
                      loading={isProcessing}
                    >
                      Pay Now
                    </ModernButton>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
