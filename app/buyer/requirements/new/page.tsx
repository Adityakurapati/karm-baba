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

export default function NewRequirementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    budget: '',
    currency: 'USD',
    requiredDeliveryDate: '',
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
      const requirementsRef = ref(database, 'requirements');
      const newRequirementRef = push(requirementsRef);
      
      // Remove any empty keys that might have slipped into formData
      const cleanedData = { ...formData };
      if ('' in cleanedData) {
        delete (cleanedData as any)[''];
      }
      
      await set(newRequirementRef, {
        ...cleanedData,
        id: newRequirementRef.key,
        buyerId: user.id,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        quantity: parseFloat(formData.quantity) || 0,
        budget: parseFloat(formData.budget) || 0,
      });

      router.push('/buyer/requirements');
    } catch (error) {
      console.error('Error posting requirement:', error);
      alert('Failed to post requirement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-background to-surface-container-low">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
                Post New Requirement
              </h1>
              <p className="text-on-surface-variant">
                Describe what you need and get quotes from verified suppliers
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-outline-variant p-6 md:p-8 shadow-soft">
              <div className="space-y-6">
                <ModernInput
                  label="Requirement Title"
                  name="title"
                  placeholder="e.g., 50,000 Meters of Organic Cotton Fabric"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
                    placeholder="Provide detailed specifications, quality requirements, etc."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModernInput
                    label="Category"
                    name="category"
                    placeholder="e.g., Textiles"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <ModernInput
                      label="Quantity"
                      name="quantity"
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                    <ModernInput
                      label="Unit"
                      name="unit"
                      placeholder="e.g., Meters"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                       <label className="block text-sm font-bold text-on-surface mb-2">Currency</label>
                       <select
                         name="currency"
                         value={formData.currency}
                         onChange={handleChange}
                         className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none text-on-surface shadow-soft hover:shadow-md"
                       >
                         <option value="USD">USD</option>
                         <option value="INR">INR</option>
                         <option value="EUR">EUR</option>
                       </select>
                    </div>
                    <div className="col-span-2">
                      <ModernInput
                        label="Budget"
                        name="budget"
                        type="number"
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <ModernInput
                    label="Required Delivery Date"
                    name="requiredDeliveryDate"
                    type="date"
                    value={formData.requiredDeliveryDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
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
                    Post Requirement
                  </ModernButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
