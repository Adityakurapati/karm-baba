'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { NotificationPreferences, NotificationCategory, NotificationChannel } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', native: 'English', region: 'Global', coverage: 100, status: 'primary' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'South Asia', coverage: 95, status: 'active' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文', region: 'East Asia', coverage: 88, status: 'active' },
  { code: 'ar', name: 'Arabic', native: 'العربية', region: 'MENA', coverage: 82, status: 'active' },
  { code: 'es', name: 'Spanish', native: 'Español', region: 'LATAM / Europe', coverage: 76, status: 'active' },
  { code: 'pt', name: 'Portuguese', native: 'Português', region: 'Brazil / Africa', coverage: 68, status: 'partial' },
  { code: 'fr', name: 'French', native: 'Français', region: 'Europe / Africa', coverage: 62, status: 'partial' },
  { code: 'de', name: 'German', native: 'Deutsch', region: 'DACH', coverage: 54, status: 'partial' },
  { code: 'ja', name: 'Japanese', native: '日本語', region: 'East Asia', coverage: 45, status: 'beta' },
  { code: 'ko', name: 'Korean', native: '한국어', region: 'East Asia', coverage: 38, status: 'beta' },
];

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Tech Corp USA',
    country: 'USA',
  });
  const [primaryLang, setPrimaryLang] = useState(i18n.language || 'en');
  const [searchLang, setSearchLang] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  // --- Notification Preferences State & Logic ---
  const defaultNotifs: NotificationPreferences = {
    dealUpdates: { email: true, whatsapp: false, inApp: true },
    newMatches: { email: true, whatsapp: false, inApp: true },
    messages: { email: false, whatsapp: false, inApp: true },
    accountUpdates: { email: true, whatsapp: false, inApp: true },
  };

  const [localNotifs, setLocalNotifs] = useState<NotificationPreferences>(
    user?.notificationPreferences || defaultNotifs
  );

  // Sync if user object updates externally
  useEffect(() => {
    if (user?.notificationPreferences) {
      setLocalNotifs(user.notificationPreferences);
    }
  }, [user?.notificationPreferences]);

  const handleNotifToggle = async (category: NotificationCategory, channel: NotificationChannel) => {
    // 1. Optimistic Update
    const prev = { ...localNotifs };
    const updated = {
      ...localNotifs,
      [category]: {
        ...localNotifs[category],
        [channel]: !localNotifs[category][channel]
      }
    };
    
    // Schema Validation: Ensure all fields are boolean
    const isValid = Object.values(updated).every(cat => 
      typeof cat.email === 'boolean' && 
      typeof cat.whatsapp === 'boolean' && 
      typeof cat.inApp === 'boolean'
    );

    if (!isValid) {
      toast.error('Invalid preference data structure');
      return;
    }

    setLocalNotifs(updated);

    // 2. API Call Persistence
    try {
      const success = await updateUserProfile({ notificationPreferences: updated });
      if (success) {
        toast.success('Preferences updated successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      // Rollback
      setLocalNotifs(prev);
      toast.error('Failed to update preferences. Reverted.');
    }
  };

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchLang.toLowerCase()) ||
      l.native.toLowerCase().includes(searchLang.toLowerCase()) ||
      l.region.toLowerCase().includes(searchLang.toLowerCase())
  );

  const tabs = ['profile', 'security', 'notifications', 'billing', 'languages'];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TopHeader title="Settings" searchPlaceholder="Search settings..." />

        <main className="flex-1 overflow-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 md:gap-4 border-b border-outline-variant overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-3 font-headline font-bold border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-headline font-black text-on-surface mb-4 md:mb-6">
              {t('settings.profile', 'Profile Information')}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">Company</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-headline font-bold text-on-surface mb-2">Country</label>
                <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary">
                  <option value="USA">United States</option>
                  <option value="China">China</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
              <button onClick={handleSave} className="w-full md:w-auto px-8 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-dark transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-headline font-black text-on-surface mb-4 md:mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div className="pb-6 border-b border-outline-variant">
                <h3 className="font-headline font-bold text-on-surface mb-2">Change Password</h3>
                <p className="text-on-surface-variant text-sm mb-4">Update your password regularly to keep your account secure</p>
                <button className="w-full sm:w-auto px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Change Password</button>
              </div>
              <div className="pb-6 border-b border-outline-variant">
                <h3 className="font-headline font-bold text-on-surface mb-2">Two-Factor Authentication</h3>
                <p className="text-on-surface-variant text-sm mb-4">Add an extra layer of security to your account</p>
                <button className="w-full sm:w-auto px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Enable 2FA</button>
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Active Sessions</h3>
                <p className="text-on-surface-variant text-sm mb-4">Manage your active login sessions</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-surface-container rounded">
                    <span className="text-on-surface font-bold text-sm md:text-base">Current Session</span>
                    <span className="text-sm text-on-surface-variant">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-headline font-black text-on-surface mb-4 md:mb-6">Notification Preferences</h2>
            
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-outline-variant text-sm font-bold text-on-surface-variant">
              <div className="col-span-6">Category</div>
              <div className="col-span-2 text-center">In-App</div>
              <div className="col-span-2 text-center">Email</div>
              <div className="col-span-2 text-center">WhatsApp</div>
            </div>

            <div className="space-y-2 pt-2">
              {[
                { title: 'Deal Updates', desc: 'Get notified about deal status changes', key: 'dealUpdates' as NotificationCategory },
                { title: 'New Matches', desc: 'Receive notifications for potential trade partners', key: 'newMatches' as NotificationCategory },
                { title: 'Messages', desc: 'Get alerts for new messages', key: 'messages' as NotificationCategory },
                { title: 'Account Updates', desc: 'Notifications about account security', key: 'accountUpdates' as NotificationCategory },
              ].map((notif, i) => (
                <div key={i} className="flex flex-col md:grid md:grid-cols-12 items-center py-4 border-b border-outline-variant last:border-b-0 gap-4">
                  <div className="col-span-6 w-full mb-2 md:mb-0">
                    <p className="font-headline font-bold text-on-surface text-sm md:text-base">{notif.title}</p>
                    <p className="text-xs md:text-sm text-on-surface-variant">{notif.desc}</p>
                  </div>
                  
                  <div className="col-span-6 w-full flex justify-between md:grid md:grid-cols-6 gap-2">
                    <label className="flex items-center gap-2 md:col-span-2 md:justify-center cursor-pointer">
                      <span className="md:hidden text-xs font-bold text-on-surface-variant">In-App</span>
                      <input 
                        type="checkbox" 
                        checked={localNotifs[notif.key].inApp} 
                        onChange={() => handleNotifToggle(notif.key, 'inApp')}
                        className="w-5 h-5 accent-primary cursor-pointer" 
                      />
                    </label>
                    <label className="flex items-center gap-2 md:col-span-2 md:justify-center cursor-pointer">
                      <span className="md:hidden text-xs font-bold text-on-surface-variant">Email</span>
                      <input 
                        type="checkbox" 
                        checked={localNotifs[notif.key].email} 
                        onChange={() => handleNotifToggle(notif.key, 'email')}
                        className="w-5 h-5 accent-primary cursor-pointer" 
                      />
                    </label>
                    <label className="flex items-center gap-2 md:col-span-2 md:justify-center cursor-pointer">
                      <span className="md:hidden text-xs font-bold text-on-surface-variant">WhatsApp</span>
                      <input 
                        type="checkbox" 
                        checked={localNotifs[notif.key].whatsapp} 
                        onChange={() => handleNotifToggle(notif.key, 'whatsapp')}
                        className="w-5 h-5 accent-green-500 cursor-pointer" 
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl border border-outline-variant p-4 md:p-8 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-headline font-black text-on-surface mb-4 md:mb-6">Billing & Subscription</h2>
            <div className="space-y-6">
              <div className="p-4 md:p-6 bg-surface-container rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h3 className="font-headline font-bold text-on-surface">Current Plan: Professional</h3>
                  <span className="text-sm font-bold text-on-surface-variant">Renews on Feb 15, 2024</span>
                </div>
                <p className="text-on-surface-variant mb-4">$299/month</p>
                <button className="w-full sm:w-auto px-6 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">Change Plan</button>
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface mb-4">Billing History</h3>
                <div className="space-y-2">
                  {[
                    { date: 'Jan 15, 2024', amount: '$299.00', status: 'Paid' },
                    { date: 'Dec 15, 2023', amount: '$299.00', status: 'Paid' },
                  ].map((invoice, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-outline-variant rounded gap-2">
                      <span className="text-on-surface font-bold text-sm">{invoice.date}</span>
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-on-surface-variant text-sm">{invoice.amount}</span>
                        <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded">{invoice.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Languages Tab — Global Language Adaptation */}
        {activeTab === 'languages' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-2xl">translate</span>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Language Adaptation</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
                      Multi-Language Trade System
                    </h2>
                    <p className="text-on-surface-variant text-sm max-w-xl">
                      Manage translations, regional adaptations, and AI-powered localization across all KARM BABA interfaces for seamless global trade.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-black text-primary">10</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Languages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-green-600">72%</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Avg. Coverage</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* Search & Primary Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-outline-variant p-6">
                <label className="text-sm font-headline font-bold text-on-surface mb-3 block">Primary Language</label>
                <select
                  value={primaryLang}
                  onChange={(e) => setPrimaryLang(e.target.value)}
                  className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant mt-2">This will be used as the default interface language.</p>
              </div>
              <div className="bg-white rounded-2xl border border-outline-variant p-6">
                <label className="text-sm font-headline font-bold text-on-surface mb-3 block">Search Languages</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    value={searchLang}
                    onChange={(e) => setSearchLang(e.target.value)}
                    placeholder="Filter by name or region..."
                    className="w-full px-4 py-3 pl-10 border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Find and manage specific language packs.</p>
              </div>
            </div>

            {/* Languages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLanguages.map((lang) => {
                const statusColors: Record<string, string> = {
                  primary: 'bg-primary text-white',
                  active: 'bg-green-100 text-green-700',
                  partial: 'bg-amber-100 text-amber-700',
                  beta: 'bg-blue-100 text-blue-700',
                };
                return (
                  <div
                    key={lang.code}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md hover:border-primary/30 p-5 ${
                      primaryLang === lang.code ? 'border-primary ring-2 ring-primary/10' : 'border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold font-headline">{lang.native}</h3>
                        <p className="text-xs text-on-surface-variant">{lang.name} — {lang.region}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${statusColors[lang.status]}`}>
                        {lang.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Translation Coverage</span>
                        <span className="text-sm font-black text-on-surface">{lang.coverage}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${lang.coverage}%`,
                            background: lang.coverage >= 90 ? '#16a34a' : lang.coverage >= 70 ? '#ff6b35' : '#f59e0b',
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-orange-50 transition-colors">
                        Edit
                      </button>
                      {primaryLang !== lang.code && (
                        <button
                          onClick={() => {
                            setPrimaryLang(lang.code);
                            document.cookie = `NEXT_LOCALE=${lang.code}; path=/; max-age=31536000; SameSite=Lax`;
                            i18n.changeLanguage(lang.code);
                            router.refresh();
                            toast.success(t('settings.success', 'Settings saved successfully'));
                          }}
                          className="flex-1 py-2 bg-primary/5 text-primary rounded-lg text-xs font-bold hover:bg-primary/10 transition-colors"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Translation & Regional Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-outline-variant shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-bold font-headline">AI Translation Hub</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Auto-Translate</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      KARM AI can auto-translate <span className="font-bold text-primary">1,240 untranslated strings</span> across Portuguese, French, and German with 94% accuracy.
                    </p>
                    <button className="mt-3 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-colors">
                      Start AI Translation
                    </button>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Quality Score</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Human-reviewed translations have a <span className="font-bold text-green-700">98.5%</span> accuracy score. AI-generated content at <span className="font-bold text-green-700">94.2%</span>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">public</span>
                  <h3 className="font-bold font-headline">Regional Adaptation</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { region: 'South Asia', langs: 'Hindi, Tamil, Bengali', users: '12K+', growth: '+34%' },
                    { region: 'East Asia', langs: 'Chinese, Japanese, Korean', users: '8.4K', growth: '+22%' },
                    { region: 'MENA', langs: 'Arabic, Persian', users: '5.2K', growth: '+45%' },
                    { region: 'LATAM', langs: 'Spanish, Portuguese', users: '6.8K', growth: '+28%' },
                  ].map((r) => (
                    <div key={r.region} className="bg-white/60 p-4 rounded-2xl flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{r.region}</h4>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{r.langs}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-on-surface">{r.users}</p>
                        <p className="text-[10px] font-bold text-green-600">{r.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
