'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Tech Corp USA',
    country: 'USA',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Mock save
    alert('Settings saved successfully!');
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
            Settings
          </h1>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto max-w-4xl">
          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-outline-variant">
            {['profile', 'security', 'notifications', 'billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-headline font-bold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-outline-variant p-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Profile Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="USA">United States</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-outline-variant p-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Security Settings
              </h2>
              <div className="space-y-6">
                <div className="pb-6 border-b border-outline-variant">
                  <h3 className="font-headline font-bold text-on-surface mb-2">
                    Change Password
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-4">
                    Update your password regularly to keep your account secure
                  </p>
                  <button className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="pb-6 border-b border-outline-variant">
                  <h3 className="font-headline font-bold text-on-surface mb-2">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                    Enable 2FA
                  </button>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-on-surface mb-2">
                    Active Sessions
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-4">
                    Manage your active login sessions
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-surface-container rounded">
                      <span className="text-on-surface font-bold">Current Session</span>
                      <span className="text-sm text-on-surface-variant">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-outline-variant p-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Deal Updates', desc: 'Get notified about deal status changes' },
                  { title: 'New Matches', desc: 'Receive notifications for potential trade partners' },
                  { title: 'Messages', desc: 'Get alerts for new messages' },
                  { title: 'Account Updates', desc: 'Notifications about account security' },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 border-b border-outline-variant last:border-b-0"
                  >
                    <div>
                      <p className="font-headline font-bold text-on-surface">
                        {notif.title}
                      </p>
                      <p className="text-sm text-on-surface-variant">{notif.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-xl border border-outline-variant p-8">
              <h2 className="text-2xl font-headline font-black text-on-surface mb-6">
                Billing & Subscription
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-surface-container rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline font-bold text-on-surface">
                      Current Plan: Professional
                    </h3>
                    <span className="text-sm font-bold text-on-surface-variant">
                      Renews on Feb 15, 2024
                    </span>
                  </div>
                  <p className="text-on-surface-variant mb-4">$299/month</p>
                  <button className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                    Change Plan
                  </button>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-on-surface mb-4">
                    Billing History
                  </h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Jan 15, 2024', amount: '$299.00', status: 'Paid' },
                      { date: 'Dec 15, 2023', amount: '$299.00', status: 'Paid' },
                    ].map((invoice, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 border border-outline-variant rounded"
                      >
                        <span className="text-on-surface font-bold">{invoice.date}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-on-surface-variant">{invoice.amount}</span>
                          <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded">
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
