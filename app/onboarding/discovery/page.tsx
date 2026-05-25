'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useAuth } from '@/lib/auth-context';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { PlatformCategory } from '@/lib/types';

const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kakinada"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Naharlagun"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Navi Mumbai"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag"]
};

export default function CombinedDiscoveryPage() {
  const router = useRouter();
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  
  // Tab Navigation state
  const [activeTab, setActiveTab] = useState('industry');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Industry Targeting state
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [industries, setIndustries] = useState<PlatformCategory[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  // 2. Location state
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [customState, setCustomState] = useState('');
  const [customCity, setCustomCity] = useState('');

  // 4. Capacity state
  const [capacity, setCapacity] = useState(4500);

  // Fetch industries/categories from Realtime Database
  useEffect(() => {
    const categoriesRef = ref(database, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const catsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })) as PlatformCategory[];
        catsArray.sort((a, b) => a.title.localeCompare(b.title));
        setIndustries(catsArray);
      } else {
        setIndustries([]);
      }
      setLoadingIndustries(false);
    });

    return () => unsubscribe();
  }, []);

  // Prepopulate from user profile
  useEffect(() => {
    if (user) {
      // 1. Industry prepopulate
      if (user.company?.industry) {
        if (Array.isArray(user.company.industry) && user.company.industry.length > 0) {
          setSelectedIndustries(user.company.industry);
        } else if (typeof user.company.industry === 'string' && user.company.industry !== '') {
          setSelectedIndustries([user.company.industry]);
        }
      } else if (user.category) {
        if (Array.isArray(user.category)) {
          setSelectedIndustries(user.category);
        } else {
          setSelectedIndustries([user.category]);
        }
      }

      // 2. Location prepopulate
      if (user.company?.location) {
        const parts = user.company.location.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const loadedCity = parts[0];
          const loadedState = parts[1];
          const loadedCountry = parts[2];

          if (loadedCountry.toLowerCase() === 'india') {
            setCountry('India');
            setState(loadedState);
            setCity(loadedCity);
          } else {
            setCountry('Other');
            setCustomCountry(loadedCountry);
            setCustomState(loadedState);
            setCustomCity(loadedCity);
          }
        }
      }
    }
  }, [user]);

  const toggleIndustry = (title: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setState('');
    setCity('');
    setCustomCountry('');
    setCustomState('');
    setCustomCity('');
  };

  const handleStateChange = (val: string) => {
    setState(val);
    setCity('');
  };

  // Indian locations lists
  const indianStates = Object.keys(INDIAN_STATES_AND_CITIES).sort();
  const citiesForState = state ? INDIAN_STATES_AND_CITIES[state] : [];

  const tabs = [
    { id: 'industry', label: 'Industry Sectors', icon: 'analytics' },
    { id: 'location', label: 'Regional Location', icon: 'location_on' },
    { id: 'capacity', label: 'Operational Capacity', icon: 'factory' },
  ];

  const handleProceed = async () => {
    if (activeTab === 'industry') {
      if (selectedIndustries.length === 0) {
        alert('Please select at least one Industry Sector first.');
        return;
      }
      setActiveTab('location');
      return;
    }

    if (activeTab === 'location') {
      const isLocationFilled = country === 'India' 
        ? (state && city) 
        : (customCountry && customState && customCity);

      if (!isLocationFilled) {
        alert('Please complete your Location preferences first.');
        return;
      }
      setActiveTab('capacity');
      return;
    }

    // activeTab === 'capacity' -> final submit!
    if (capacity <= 0) {
      alert('Please enter a valid Operational Capacity (> 0 MT).');
      return;
    }

    setIsSaving(true);
    try {
      const finalCountry = country === 'India' ? 'India' : customCountry;
      const finalState = country === 'India' ? state : customState;
      const finalCity = country === 'India' ? city : customCity;

      const success = await updateUserProfile({
        category: selectedIndustries,
        company: {
          ...(user?.company || { id: '', name: '', registrationNumber: '', industry: '', location: '', employees: 0, yearEstablished: 0 }),
          industry: selectedIndustries,
          location: `${finalCity}, ${finalState}, ${finalCountry}`
        },
        onboardingStep: 4, // proceed to Step 4: Documents
      });

      if (success) {
        router.push('/onboarding/documents');
      } else {
        alert('Failed to save profile setup. Please try again.');
      }
    } catch (error) {
      console.error('Error saving discovery profile setup:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-32">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Step 3 of 5</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight font-headline">Discovery &amp; Profile</h1>
            <p className="text-on-surface-variant mt-2 text-lg">Define commercial sectors, operational models, and geographical trade parameters.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto bg-slate-50/50 p-2 rounded-xl border">
          {tabs.map((tab) => {
            const isCompleted = tab.id === 'industry' 
              ? selectedIndustries.length > 0 
              : tab.id === 'location' 
              ? (country === 'India' ? (state && city) : (customCountry && customState && customCity))
              : capacity > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-headline font-bold text-sm transition-all border-b-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-white shadow-sm'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-slate-100/50'
                }`}
              >
                <span className="material-symbols-outlined notranslate text-lg" translate="no">
                  {isCompleted && activeTab !== tab.id ? 'check_circle' : tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bento Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Smart Form Area */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <section className="bg-white rounded-2xl p-8 md:p-10 border border-outline-variant/20 shadow-sm min-h-[400px]">
              
              {/* Tab 1: Industry Targeting */}
              {activeTab === 'industry' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-headline font-extrabold text-2xl text-on-surface">Target Sectors</h3>
                      <p className="text-sm text-on-surface-variant mt-1">Select the commercial channels that align with your trade influence.</p>
                    </div>
                  </div>

                  {loadingIndustries ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-on-surface-variant font-bold text-sm">Loading available industries...</p>
                    </div>
                  ) : industries.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">No trade sectors found.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {industries.map((ind) => {
                        const isSelected = selectedIndustries.includes(ind.title);
                        return (
                          <button
                            key={ind.id}
                            onClick={() => toggleIndustry(ind.title)}
                            className={`px-5 py-3 rounded-xl text-sm font-bold font-headline transition-all duration-200 flex items-center gap-2 border ${
                              isSelected 
                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/15 scale-[1.02]' 
                                : 'bg-slate-50 text-slate-700 border-outline-variant/30 hover:border-primary/50 hover:bg-orange-50/20'
                            }`}
                          >
                            {isSelected && <span className="material-symbols-outlined notranslate text-[16px]" translate="no">check_circle</span>}
                            {ind.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}


              {/* Tab 3: Regional Profile (Location Selector) */}
              {activeTab === 'location' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="font-headline font-extrabold text-2xl text-on-surface">Regional Trade Hub</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Locate your primary logistics corridor and administrative hubs.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Country */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Country / Trade Region</label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-4 px-6 appearance-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-semibold cursor-pointer"
                        >
                          <option value="India">India 🇮🇳</option>
                          <option value="Other">Other Country / Global Corridor 🌍</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="material-symbols-outlined notranslate text-on-surface-variant" translate="no">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {country === 'India' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* State */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">State / Union Territory</label>
                          <div className="relative">
                            <select
                              value={state}
                              onChange={(e) => handleStateChange(e.target.value)}
                              className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-4 px-6 appearance-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-semibold cursor-pointer"
                            >
                              <option value="">Select State</option>
                              {indianStates.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="material-symbols-outlined notranslate text-on-surface-variant" translate="no">expand_more</span>
                            </div>
                          </div>
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">City / Logistics Cluster</label>
                          <div className="relative">
                            <select
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              disabled={!state}
                              className="w-full bg-slate-50 border border-outline-variant/30 rounded-xl py-4 px-6 appearance-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-semibold cursor-pointer disabled:opacity-50"
                            >
                              <option value="">Select City</option>
                              {citiesForState.map((ct) => (
                                <option key={ct} value={ct}>{ct}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="material-symbols-outlined notranslate text-on-surface-variant" translate="no">expand_more</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Custom Country Name</label>
                          <input
                            type="text"
                            value={customCountry}
                            onChange={(e) => setCustomCountry(e.target.value)}
                            placeholder="Enter Country (e.g. United Kingdom)"
                            className="w-full px-4 py-3.5 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">State / Province</label>
                            <input
                              type="text"
                              value={customState}
                              onChange={(e) => setCustomState(e.target.value)}
                              placeholder="Enter Province / Territory"
                              className="w-full px-4 py-3.5 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                              disabled={!customCountry}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">City</label>
                            <input
                              type="text"
                              value={customCity}
                              onChange={(e) => setCustomCity(e.target.value)}
                              placeholder="Enter City"
                              className="w-full px-4 py-3.5 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-semibold"
                              disabled={!customState}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Operational Capacity */}
              {activeTab === 'capacity' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="font-headline font-extrabold text-2xl text-on-surface">Annual Production / Sourcing Limits</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Provide your current operational capability threshold in Metric Tons (MT).</p>
                  </div>

                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                        Annual Capacity limit
                      </label>
                      <span className="text-lg font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{capacity.toLocaleString()} MT</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-grow w-full">
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="500"
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-2 px-1 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                          <span>0 MT</span>
                          <span>50,000 MT</span>
                        </div>
                      </div>
                      <div className="relative shrink-0 w-full sm:w-auto">
                        <input 
                          type="number"
                          min="0"
                          max="50000"
                          value={capacity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCapacity(val < 0 ? 0 : val > 50000 ? 50000 : val);
                          }}
                          className="w-full sm:w-36 bg-white border-2 border-primary/20 focus:border-primary focus:ring-0 rounded-xl pl-4 pr-10 py-3 font-bold text-primary text-center outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-primary/50 pointer-events-none">MT</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>

            {/* Submit HUD */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center border border-outline-variant/20 shadow-lg gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-on-surface-variant italic">Data auto-saves in real-time</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (activeTab === 'capacity') {
                      setActiveTab('location');
                    } else if (activeTab === 'location') {
                      setActiveTab('industry');
                    } else {
                      router.push('/onboarding/account');
                    }
                  }}
                  className="text-primary font-bold px-8 py-3 rounded-full hover:bg-primary/5 transition-all text-xs uppercase tracking-widest border border-primary/10"
                >
                  Previous
                </button>
                <button
                  onClick={handleProceed}
                  disabled={isSaving || authLoading}
                  className="text-white font-bold px-10 py-3 rounded-full hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
                >
                  {isSaving ? 'Saving...' : authLoading ? 'Loading Profile...' : (
                    activeTab === 'industry' ? 'Next: Regional Location' :
                    activeTab === 'location' ? 'Next: Operational Capacity' :
                    'Analyze & Proceed'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Target Hub Recommendation */}
              <div className="text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c44b1a, #e55a24)' }}>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="material-symbols-outlined notranslate text-orange-200" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <h3 className="text-xl font-bold tracking-tight font-headline">AI Profile Assistant</h3>
                </div>
                <div className="space-y-6 relative z-10">
                  <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/10 text-xs leading-relaxed">
                    Based on your selected sector <span className="text-orange-200 font-bold">{selectedIndustries[0] || '(no sector selected yet)'}</span>, we will optimize matching supply pipelines and trade route compliance.
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="bg-orange-200 text-orange-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                      <p className="text-[11px] opacity-90 leading-snug">Add dynamic regions to get tailored RFQs directly to your dashboard.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-orange-200 text-orange-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                      <p className="text-[11px] opacity-90 leading-snug">Set accurate capacity targets to build verified institutional trust.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 space-y-4">
                <h4 className="text-xs font-black text-on-surface uppercase tracking-widest font-headline">Setup Progress</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Sectors Selected:</span>
                    <span className="text-primary">{selectedIndustries.length}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Active Hub:</span>
                    <span className="text-primary">
                      {country === 'India' ? (city || 'Not set') : (customCity || 'Not set')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Capacity Limit:</span>
                    <span className="text-primary">{capacity.toLocaleString()} MT</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
