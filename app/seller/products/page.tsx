'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getProductsBySellerId } from '@/lib/mockData';

export default function SellerProductsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const products = getProductsBySellerId(user.id);

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8">
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
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
            >
              + Add Product
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 min-w-64 px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none"
            />
            <select className="px-4 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none">
              <option>All Categories</option>
              <option>Automotive</option>
              <option>Textiles</option>
              <option>Electronics</option>
              <option>Industrial</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-outline-variant">
                <p className="text-on-surface-variant text-lg mb-4">No products yet</p>
                <Link
                  href="/seller/products/new"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  Add Your First Product
                </Link>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-outline-variant overflow-hidden hover:border-primary transition-colors"
                >
                  {/* Image */}
                  <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
                      {product.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-outline-variant">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant text-sm">Price</span>
                        <span className="font-bold text-on-surface">
                          ${product.basePrice.toLocaleString()} {product.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant text-sm">MOQ</span>
                        <span className="font-bold text-on-surface">
                          {product.minimumOrderQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant text-sm">Available</span>
                        <span className="font-bold text-on-surface">
                          {product.availableQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant text-sm">Lead Time</span>
                        <span className="font-bold text-on-surface">
                          {product.leadTime} days
                        </span>
                      </div>
                    </div>

                    {/* Certifications */}
                    {product.certifications.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-on-surface-variant mb-2">Certifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {product.certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/seller/products/${product.id}`}
                        className="flex-1 px-3 py-2 text-center bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors"
                      >
                        Edit
                      </Link>
                      <button className="flex-1 px-3 py-2 text-center bg-gray-100 text-on-surface rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
