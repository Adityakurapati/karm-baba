'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function NewDealPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buyer: '',
    supplier: '',
    value: '',
    currency: 'USD',
    deadline: '',
    category: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/deals');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-outline-variant p-6 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-2xl font-headline font-black text-on-surface flex-1 ml-4">
            Create New Deal
          </h1>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Electronics Import Deal"
                required
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about this deal..."
                required
                rows={4}
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Buyer & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Buyer *
                </label>
                <input
                  type="text"
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleChange}
                  placeholder="Buyer company name"
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Supplier *
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Supplier company name"
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Value */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Deal Value *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Textiles">Textiles</option>
                <option value="Industrial">Industrial Materials</option>
                <option value="Machinery">Machinery</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Food">Food & Beverages</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                Target Completion Date *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-primary text-primary font-headline font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Deal
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
