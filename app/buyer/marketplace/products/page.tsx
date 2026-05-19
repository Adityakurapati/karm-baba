'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { ModernButton } from '@/components/ModernButton';
import { ModernCard } from '@/components/ModernCard';

export default function BuyerProductMarketplace() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-outline-variant shadow-soft">
                  <p className="text-on-surface-variant text-xl">No products available at the moment.</p>
                </div>
              ) : (
                products.map((product) => (
                  <ModernCard key={product.id} hover className="flex flex-col h-full bg-white border border-outline-variant rounded-2xl overflow-hidden group">
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📦</span>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-lg font-headline font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant mb-2">by {product.sellerName || 'Verified Seller'}</p>
                        <p className="text-sm text-on-surface-variant line-clamp-2 min-h-[40px]">
                          {product.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-outline-variant/30">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Price</p>
                          <p className="text-lg font-headline font-black text-primary">
                            {product.currency || '$'}{product.price?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Stock</p>
                          <p className="text-sm font-bold text-on-surface">{product.stock} units</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleConnect(product)}
                          className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => handleBuyClick(product)}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all hover:scale-[1.02] shadow-md shadow-primary/20"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </ModernCard>
                ))
              )}
            </div>
          </div>
        </div>

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
