'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, set } from 'firebase/database';
import { ModernBadge } from '@/components/ModernBadge';

export default function SellerProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const productsRef = ref(database, 'products');
    const q = query(productsRef, orderByChild('sellerId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
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
  }, [user]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const productRef = ref(database, `products/${productId}`);
      await set(productRef, null);
      alert('Product deleted successfully.');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      product.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchesLocation = 
      locationFilter === 'All Locations' || 
      product.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (authLoading || loading) return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
                Product Inventory
              </h1>
              <p className="text-on-surface-variant">
                Manage your product listings and inventory
              </p>
            </div>
            <Link
              href="/seller/products/new"
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors text-sm"
            >
              + Add Product
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2.5 border border-outline-variant rounded-xl focus:border-primary outline-none bg-white text-on-surface text-sm transition-all"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-outline-variant rounded-xl focus:border-primary outline-none bg-white text-on-surface text-sm transition-all"
            >
              <option value="All Categories">All Categories</option>
              <option value="Automotive">Automotive</option>
              <option value="Textiles">Textiles</option>
              <option value="Electronics">Electronics</option>
              <option value="Industrial">Industrial</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2.5 border border-outline-variant rounded-xl focus:border-primary outline-none bg-white text-on-surface text-sm transition-all"
            >
              <option value="All Locations">All Locations</option>
              <option value="Global">Global</option>
              <option value="USA">USA</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">
                  {products.length === 0 ? "No products listed yet" : "No matching products found"}
                </p>
                {products.length === 0 && (
                  <Link
                    href="/seller/products/new"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                  >
                    Add Your First Product
                  </Link>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-outline-variant p-4 hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 aspect-square flex flex-col justify-between overflow-hidden"
                >
                  {/* Top content */}
                  <div className="min-h-0 flex-1 flex flex-col">
                    <div className="flex justify-between items-center gap-1 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded truncate max-w-[60%]" title={product.category}>
                        {product.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-primary shrink-0">
                        {product.currency || '$'}{product.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1 min-w-0">
                      <span className="text-sm shrink-0">📦</span>
                      <h3 className="text-xs font-bold text-on-surface line-clamp-1 leading-snug flex-1 truncate" title={product.name}>
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-on-surface-variant text-[10px] line-clamp-3 leading-relaxed flex-1 overflow-hidden">
                      {product.description}
                    </p>
                  </div>

                  {/* Bottom content */}
                  <div className="pt-2 border-t border-outline-variant mt-2 shrink-0">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full py-1.5 text-center text-[10px] bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Beautiful Product Details Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <ModernBadge variant="success">Product Listing</ModernBadge>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-surface-container-low p-2 rounded-xl border border-outline-variant">📦</span>
                  <div>
                    <h2 className="text-2xl font-headline font-black text-on-surface leading-snug">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Product ID: {selectedProduct.id}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price</p>
                    <p className="text-base font-black text-primary">
                      {selectedProduct.currency || '$'}{selectedProduct.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">MOQ</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedProduct.moq} units
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stock Available</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedProduct.stock} units
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Lead Time</p>
                    <p className="text-base font-black text-on-surface">
                      {selectedProduct.leadTime} days
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description & Technical Specifications</h3>
                  <div className="text-on-surface text-sm whitespace-pre-wrap bg-surface-container-lowest p-4 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedProduct.description}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex gap-3 justify-between items-center">
                <button
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all text-sm"
                >
                  Delete Product
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-lg font-bold transition-all text-sm"
                  >
                    Close
                  </button>
                  <Link
                    href={`/seller/products/${selectedProduct.id}`}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all text-sm text-center"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Edit Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

