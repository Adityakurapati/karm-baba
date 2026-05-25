'use client';

import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedRoute>
      <DashboardLayout title="My Profile" searchPlaceholder="Search profile data...">

        
        <main className="flex-1 overflow-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-outline-variant pb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline font-black text-4xl shrink-0">
                {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold font-headline text-on-surface mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-on-surface-variant font-medium">{user.email}</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                  {user.phone && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">call</span>
                      {user.phone}
                    </span>
                  )}
                  {user.company?.registrationNumber && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">verified</span>
                      GST Verified
                    </span>
                  )}
                  {user.role === 'individual' && (user.onboardingStep || 0) >= 2 && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                      <span className="material-symbols-outlined notranslate text-[14px]" translate="no">verified</span>
                      Identity Verified
                    </span>
                  )}
                  <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200 shadow-sm shadow-primary/10">
                    <span className="material-symbols-outlined notranslate text-[14px]" translate="no">workspace_premium</span>
                    Karm Baba Verified
                  </span>
                </div>
              </div>
              <div>
                <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Personal Information</h3>
                <div className="space-y-4">
                  <div className="bg-surface-container p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Full Name</span>
                    <p className="font-semibold text-on-surface">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="bg-surface-container p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Email Address</span>
                    <p className="font-semibold text-on-surface">{user.email}</p>
                  </div>
                  <div className="bg-surface-container p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Phone Number</span>
                    <p className="font-semibold text-on-surface">{user.phone || 'Not Provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Business & Identity Details</h3>
                <div className="space-y-4">
                  {user.role !== 'individual' ? (
                    <>
                      <div className="bg-surface-container p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Company Name</span>
                        <p className="font-semibold text-on-surface">{user.company?.name || 'Not Provided'}</p>
                      </div>
                      <div className="bg-surface-container p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">GST IN</span>
                        <p className="font-semibold text-on-surface">{user.company?.registrationNumber || 'Not Provided'}</p>
                      </div>
                      <div className="bg-surface-container p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Location</span>
                        <p className="font-semibold text-on-surface">{user.company?.location || 'Not Provided'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-surface-container p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">PAN Number</span>
                        <p className="font-semibold text-on-surface">Verified (Hidden for security)</p>
                      </div>
                      <div className="bg-surface-container p-4 rounded-xl">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Aadhar Number</span>
                        <p className="font-semibold text-on-surface">Verified (Hidden for security)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-outline-variant flex justify-center">
               <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center max-w-lg w-full">
                 <span className="material-symbols-outlined notranslate text-green-600 text-4xl mb-2" translate="no">shield_person</span>
                 <h4 className="font-bold text-green-800 text-lg">Fully Authenticated Account</h4>
                 <p className="text-sm text-green-700 mt-1">Your identity and documentation have been verified by the Karm Baba trust protocol.</p>
               </div>
            </div>

          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
