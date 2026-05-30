'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { STATE_NAMES } from '@/lib/gst-codes';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'organization'>('personal');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    // Organization fields
    companyName: '',
    gstin: '',
    registrationNumber: '',
    entityType: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    employeesRange: '',
    yearEstablished: '',
    turnoverRange: '',
    website: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        companyName: user.company?.name || '',
        gstin: (user.company as any)?.gstin || user.gstDetails?.gstin || '',
        registrationNumber: user.company?.registrationNumber || '',
        entityType: (user.company as any)?.entityType || '',
        addressLine1: (user.company as any)?.addressLine1 || '',
        addressLine2: (user.company as any)?.addressLine2 || '',
        city: (user.company as any)?.city || '',
        state: (user.company as any)?.state || '',
        pinCode: (user.company as any)?.pinCode || '',
        employeesRange: (user.company as any)?.employeesRange || '',
        yearEstablished: user.company?.yearEstablished ? String(user.company.yearEstablished) : '',
        turnoverRange: (user.company as any)?.turnoverRange || '',
        website: (user.company as any)?.website || user.company?.website || '',
      });
    }
  }, [user]);

  if (!user) return null;

  const isIndividual = user.role === 'individual';
  const hasGstBadge = user.isGstVerified || user.verificationBadges?.some(b => b.type === 'gst');
  const hasPanBadge = user.verificationBadges?.some(b => b.type === 'pan');

  const handleSave = async () => {
    setSaving(true);
    const updates: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    };

    if (!isIndividual) {
      updates.company = {
        ...user.company,
        name: formData.companyName,
        gstin: formData.gstin.toUpperCase(),
        registrationNumber: formData.registrationNumber,
        entityType: formData.entityType,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        employeesRange: formData.employeesRange,
        yearEstablished: parseInt(formData.yearEstablished) || 0,
        turnoverRange: formData.turnoverRange,
        website: formData.website,
      };
    }

    const success = await updateUserProfile(updates);
    if (success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        companyName: user.company?.name || '',
        gstin: (user.company as any)?.gstin || user.gstDetails?.gstin || '',
        registrationNumber: user.company?.registrationNumber || '',
        entityType: (user.company as any)?.entityType || '',
        addressLine1: (user.company as any)?.addressLine1 || '',
        addressLine2: (user.company as any)?.addressLine2 || '',
        city: (user.company as any)?.city || '',
        state: (user.company as any)?.state || '',
        pinCode: (user.company as any)?.pinCode || '',
        employeesRange: (user.company as any)?.employeesRange || '',
        yearEstablished: user.company?.yearEstablished ? String(user.company.yearEstablished) : '',
        turnoverRange: (user.company as any)?.turnoverRange || '',
        website: (user.company as any)?.website || user.company?.website || '',
      });
    }
    setIsEditing(false);
  };

  const Field = ({
    label,
    editContent,
    viewContent,
    icon,
  }: {
    label: string;
    editContent: React.ReactNode;
    viewContent: React.ReactNode;
    icon?: string;
  }) => (
    <div className="bg-surface-container p-4 rounded-xl relative">
      {icon && (
        <span
          className="absolute top-4 right-4 material-symbols-outlined notranslate text-on-surface-variant/20 text-xl"
          translate="no"
        >
          {icon}
        </span>
      )}
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">
        {label}
      </span>
      {isEditing ? editContent : viewContent}
    </div>
  );

  const inputClass =
    'w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm font-semibold text-on-surface focus:border-primary focus:outline-none transition-colors';

  return (
    <ProtectedRoute>
      <DashboardLayout title="My Profile" searchPlaceholder="Search profile data...">
        <main className="flex-1 overflow-auto p-4 md:p-8 max-w-5xl mx-auto w-full">

          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl text-white flex items-center justify-center font-headline font-black text-4xl shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
              >
                {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold font-headline text-on-surface mb-1 truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-on-surface-variant font-medium text-sm mb-3">{user.email}</p>

                {/* Badges Row */}
                <div className="flex gap-2 flex-wrap">
                  {/* Role Badge */}
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>

                  {/* GST Verified Badge */}
                  {hasGstBadge && (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                        description
                      </span>
                      GST Verified
                    </span>
                  )}

                  {/* PAN Verified Badge */}
                  {hasPanBadge && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                        credit_card
                      </span>
                      PAN Verified
                    </span>
                  )}

                  {/* Individual Identity Verified Badge */}
                  {isIndividual && hasPanBadge && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                        fingerprint
                      </span>
                      Identity Verified
                    </span>
                  )}

                  {/* Karm Baba Certified — only shown when admin has set this flag */}
                  {user.isKarmBabaCertified && (
                    <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200 shadow-sm shadow-primary/10">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>
                        workspace_premium
                      </span>
                      Karm Baba Certified
                    </span>
                  )}
                </div>
              </div>

              {/* Edit / Save Actions */}
              <div className="shrink-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors text-sm"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm"
                      style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin material-symbols-outlined notranslate text-sm" translate="no">sync</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined notranslate text-sm" translate="no">save</span>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
                  >
                    <span className="material-symbols-outlined notranslate text-sm" translate="no">edit</span>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex bg-white rounded-xl border border-outline-variant p-1 mb-6 gap-1">
            <button
              onClick={() => setActiveSection('personal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                activeSection === 'personal'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined notranslate text-base" translate="no">manage_accounts</span>
              Personal Details
            </button>
            {!isIndividual && (
              <button
                onClick={() => setActiveSection('organization')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                  activeSection === 'organization'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined notranslate text-base" translate="no">domain</span>
                Organization Details
              </button>
            )}
          </div>

          {/* Personal Section */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-sm animate-in fade-in duration-300">
              <h3 className="font-headline font-bold text-lg mb-6 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined notranslate text-primary" translate="no">person</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  icon="badge"
                  editContent={
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      className={inputClass}
                      placeholder="First Name"
                    />
                  }
                  viewContent={<p className="font-semibold text-on-surface">{user.firstName || 'Not Provided'}</p>}
                />
                <Field
                  label="Last Name"
                  icon="badge"
                  editContent={
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      className={inputClass}
                      placeholder="Last Name"
                    />
                  }
                  viewContent={<p className="font-semibold text-on-surface">{user.lastName || 'Not Provided'}</p>}
                />
                <Field
                  label="Email Address"
                  icon="email"
                  editContent={
                    <div>
                      <p className="font-semibold text-on-surface opacity-60">{user.email}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed</p>
                    </div>
                  }
                  viewContent={<p className="font-semibold text-on-surface">{user.email}</p>}
                />
                <Field
                  label="Phone Number"
                  icon="call"
                  editContent={
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  }
                  viewContent={<p className="font-semibold text-on-surface">{user.phone || 'Not Provided'}</p>}
                />
                {user.role && (
                  <Field
                    label="Account Role"
                    icon="shield_person"
                    editContent={<p className="font-semibold text-on-surface capitalize">{user.role}</p>}
                    viewContent={<p className="font-semibold text-on-surface capitalize">{user.role}</p>}
                  />
                )}
              </div>

              {/* Verification Summary for Individual */}
              {isIndividual && (
                <div className="mt-6 pt-6 border-t border-outline-variant">
                  <h4 className="font-headline font-bold text-sm mb-4 text-on-surface-variant uppercase tracking-widest">
                    Identity Verification Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${hasPanBadge ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-outline-variant/30'}`}>
                      <span
                        className={`material-symbols-outlined notranslate text-2xl ${hasPanBadge ? 'text-emerald-600' : 'text-on-surface-variant/40'}`}
                        translate="no"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        credit_card
                      </span>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${hasPanBadge ? 'text-emerald-800' : 'text-on-surface-variant'}`}>
                          PAN Verified
                        </p>
                        <p className={`text-xs mt-0.5 ${hasPanBadge ? 'text-emerald-700' : 'text-on-surface-variant/60'}`}>
                          {hasPanBadge
                            ? (user.verificationBadges?.find(b => b.type === 'pan')?.number || 'Verified')
                            : 'Not yet verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Organization Section */}
          {!isIndividual && activeSection === 'organization' && (
            <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-sm animate-in fade-in duration-300 space-y-8">
              {/* Verification Badges */}
              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary" translate="no">verified</span>
                  Verification Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GST Verified Badge Card */}
                  <div className={`p-5 rounded-xl border flex items-center gap-4 ${hasGstBadge ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-outline-variant/30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasGstBadge ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <span
                        className={`material-symbols-outlined notranslate text-2xl ${hasGstBadge ? 'text-emerald-600' : 'text-on-surface-variant/40'}`}
                        translate="no"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        description
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest ${hasGstBadge ? 'text-emerald-800' : 'text-on-surface-variant'}`}>
                        GST Verified
                      </p>
                      <p className={`text-xs font-mono font-bold mt-0.5 ${hasGstBadge ? 'text-emerald-700' : 'text-on-surface-variant/50'}`}>
                        {hasGstBadge
                          ? (user.gstDetails?.gstin || (user.company as any)?.gstin || 'Verified')
                          : 'Pending verification'}
                      </p>
                    </div>
                  </div>

                  {/* PAN Verified Badge Card */}
                  <div className={`p-5 rounded-xl border flex items-center gap-4 ${hasPanBadge ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-outline-variant/30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasPanBadge ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      <span
                        className={`material-symbols-outlined notranslate text-2xl ${hasPanBadge ? 'text-blue-600' : 'text-on-surface-variant/40'}`}
                        translate="no"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        credit_card
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest ${hasPanBadge ? 'text-blue-800' : 'text-on-surface-variant'}`}>
                        PAN Verified
                      </p>
                      <p className={`text-xs font-mono font-bold mt-0.5 ${hasPanBadge ? 'text-blue-700' : 'text-on-surface-variant/50'}`}>
                        {hasPanBadge
                          ? (user.gstDetails?.gstin?.substring(2, 12) || user.verificationBadges?.find(b => b.type === 'pan')?.number || 'Verified')
                          : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Company Details */}
              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary" translate="no">domain</span>
                  Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Company / Trade Name"
                    icon="domain"
                    editContent={
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                        className={inputClass}
                        placeholder="Acme Industrial Ltd."
                      />
                    }
                    viewContent={<p className="font-semibold text-on-surface">{user.company?.name || 'Not Provided'}</p>}
                  />
                  <Field
                    label="GSTIN / GST Number"
                    icon="receipt_long"
                    editContent={
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={e => setFormData(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                        className={`${inputClass} uppercase`}
                        placeholder="27AAAAA1111A1Z1"
                      />
                    }
                    viewContent={
                      <p className="font-semibold font-mono text-on-surface">
                        {(user.company as any)?.gstin || user.gstDetails?.gstin || 'Not Provided'}
                      </p>
                    }
                  />
                  <Field
                    label="Entity / Organization Type"
                    icon="gavel"
                    editContent={
                      <select
                        value={formData.entityType}
                        onChange={e => setFormData(p => ({ ...p, entityType: e.target.value }))}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="">Select Entity Type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership Firm">Partnership Firm</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="Public Limited Company">Public Limited Company</option>
                        <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                        <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                        <option value="Trust / Society / AOP">Trust / Society / AOP</option>
                      </select>
                    }
                    viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.entityType || 'Not Provided'}</p>}
                  />
                  <Field
                    label="Registration / CIN Number"
                    icon="article"
                    editContent={
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))}
                        className={inputClass}
                        placeholder="U12345MH2026PTC123456"
                      />
                    }
                    viewContent={<p className="font-semibold text-on-surface">{user.company?.registrationNumber || 'Not Provided'}</p>}
                  />
                </div>
              </div>

              {/* Registered Address */}
              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary" translate="no">location_on</span>
                  Registered Address
                </h3>
                <div className="space-y-4">
                  <Field
                    label="Address Line 1"
                    editContent={
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={e => setFormData(p => ({ ...p, addressLine1: e.target.value }))}
                        className={inputClass}
                        placeholder="Building No, Street Name"
                      />
                    }
                    viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.addressLine1 || 'Not Provided'}</p>}
                  />
                  <Field
                    label="Address Line 2 (Optional)"
                    editContent={
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={e => setFormData(p => ({ ...p, addressLine2: e.target.value }))}
                        className={inputClass}
                        placeholder="Floor, Suite, Landmark"
                      />
                    }
                    viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.addressLine2 || '—'}</p>}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="City"
                      editContent={
                        <input
                          type="text"
                          value={formData.city}
                          onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                          className={inputClass}
                          placeholder="Mumbai"
                        />
                      }
                      viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.city || 'Not Provided'}</p>}
                    />
                    <Field
                      label="State"
                      editContent={
                        <select
                          value={formData.state}
                          onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="">Select State</option>
                          {STATE_NAMES.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      }
                      viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.state || 'Not Provided'}</p>}
                    />
                    <Field
                      label="PIN Code"
                      editContent={
                        <input
                          type="text"
                          value={formData.pinCode}
                          onChange={e => setFormData(p => ({ ...p, pinCode: e.target.value }))}
                          className={inputClass}
                          placeholder="400001"
                          maxLength={6}
                        />
                      }
                      viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.pinCode || 'Not Provided'}</p>}
                    />
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary" translate="no">bar_chart</span>
                  Operational Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field
                    label="Year Established"
                    icon="calendar_month"
                    editContent={
                      <input
                        type="text"
                        value={formData.yearEstablished}
                        onChange={e => setFormData(p => ({ ...p, yearEstablished: e.target.value }))}
                        className={inputClass}
                        placeholder="2010"
                      />
                    }
                    viewContent={<p className="font-semibold text-on-surface">{user.company?.yearEstablished || 'Not Provided'}</p>}
                  />
                  <Field
                    label="Total Employees"
                    icon="group"
                    editContent={
                      <select
                        value={formData.employeesRange}
                        onChange={e => setFormData(p => ({ ...p, employeesRange: e.target.value }))}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="">Select Range</option>
                        <option value="1-10">1 - 10</option>
                        <option value="11-50">11 - 50</option>
                        <option value="51-200">51 - 200</option>
                        <option value="201-500">201 - 500</option>
                        <option value="500+">500+</option>
                      </select>
                    }
                    viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.employeesRange || 'Not Provided'}</p>}
                  />
                  <Field
                    label="Annual Turnover"
                    icon="trending_up"
                    editContent={
                      <select
                        value={formData.turnoverRange}
                        onChange={e => setFormData(p => ({ ...p, turnoverRange: e.target.value }))}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="">Select Range</option>
                        <option value="Under ₹1 Crore">Under ₹1 Crore</option>
                        <option value="₹1 Crore - ₹5 Crore">₹1 Crore - ₹5 Crore</option>
                        <option value="₹5 Crore - ₹20 Crore">₹5 Crore - ₹20 Crore</option>
                        <option value="₹20 Crore - ₹100 Crore">₹20 Crore - ₹100 Crore</option>
                        <option value="Above ₹100 Crore">Above ₹100 Crore</option>
                      </select>
                    }
                    viewContent={<p className="font-semibold text-on-surface">{(user.company as any)?.turnoverRange || 'Not Provided'}</p>}
                  />
                </div>
                <div className="mt-4">
                  <Field
                    label="Company Website"
                    icon="language"
                    editContent={
                      <input
                        type="url"
                        value={formData.website}
                        onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
                        className={inputClass}
                        placeholder="https://acmeindustries.com"
                      />
                    }
                    viewContent={
                      <p className="font-semibold text-on-surface">
                        {(user.company as any)?.website || user.company?.website ? (
                          <a
                            href={
                              ((user.company as any)?.website || user.company?.website).startsWith('http')
                                ? ((user.company as any)?.website || user.company?.website)
                                : `https://${(user.company as any)?.website || user.company?.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {(user.company as any)?.website || user.company?.website}
                          </a>
                        ) : (
                          'Not Provided'
                        )}
                      </p>
                    }
                  />
                </div>
              </div>

              {/* Save Button at bottom when editing */}
              {isEditing && (
                <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl transition-colors text-sm"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-sm hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin material-symbols-outlined notranslate text-sm" translate="no">sync</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined notranslate text-sm" translate="no">save</span>
                        Save All Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
