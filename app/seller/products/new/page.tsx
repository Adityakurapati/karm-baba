'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ModernInput } from '@/components/ModernInput';
import { ModernButton } from '@/components/ModernButton';
import { database } from '@/lib/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';

export default function NewProductPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    moq: '',
    stock: '',
    leadTime: '',
  });

  if (isLoading || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const productsRef = ref(database, 'products');
      const newProductRef = push(productsRef);
      
      await set(newProductRef, {
        ...formData,
        id: newProductRef.key,
        sellerId: user.id,
        sellerName: `${user.firstName} ${user.lastName}`,
        createdAt: serverTimestamp(),
        price: parseFloat(formData.price) || 0,
        moq: parseInt(formData.moq) || 1,
        stock: parseInt(formData.stock) || 0,
        leadTime: parseInt(formData.leadTime) || 7,
      });

      router.push('/seller/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-4xl font-headline font-black text-on-surface mb-2">
                Add New Product
              </h1>
              <p className="text-on-surface-variant">
                List your product on the global marketplace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-outline-variant p-6 md:p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <ModernInput
                    label="Product Name"
                    name="name"
                    placeholder="e.g., High-Grade Cotton Yarn"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft"
                    placeholder="Detailed product specifications..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <ModernInput
                  label="Category"
                  name="category"
                  placeholder="e.g., Textiles"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-on-surface mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <ModernInput
                      label="Price per Unit"
                      name="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <ModernInput
                  label="Minimum Order Quantity (MOQ)"
                  name="moq"
                  type="number"
                  placeholder="1"
                  value={formData.moq}
                  onChange={handleChange}
                  required
                />

                <ModernInput
                  label="Available Stock"
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />

                <ModernInput
                  label="Lead Time (Days)"
                  name="leadTime"
                  type="number"
                  placeholder="7"
                  value={formData.leadTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-4 mt-10">
                <ModernButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  type="button"
                >
                  Cancel
                </ModernButton>
                <ModernButton
                  variant="primary"
                  className="flex-1"
                  type="submit"
                  loading={isSubmitting}
                >
                  List Product
                </ModernButton>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
