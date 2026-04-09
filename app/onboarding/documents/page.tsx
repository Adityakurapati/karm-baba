'use client';

import { useRouter } from 'next/navigation';
import OnboardingLayout from '@/components/OnboardingLayout';

const documentSlots = [
  {
    icon: 'description',
    title: 'GST Registration',
    desc: 'Official certificate issued by the tax authority.',
    badge: 'MANDATORY',
    badgeColor: 'bg-red-100 text-red-700',
    span: 1,
  },
  {
    icon: 'badge',
    title: 'PAN Card',
    desc: 'Permanent Account Number (Business or Individual).',
    badge: 'MANDATORY',
    badgeColor: 'bg-red-100 text-red-700',
    span: 1,
  },
  {
    icon: 'public',
    title: 'IEC Certificate',
    desc: 'Import Export Code issued by the DGFT. Mandatory for all cross-border trade operations managed by KARM BABA.',
    badge: 'REQUIRED FOR EXPORTS',
    badgeColor: 'bg-primary/10 text-primary',
    span: 2,
  },
];

export default function DocumentUploadPage() {
  const router = useRouter();

  return (
    <OnboardingLayout>
      <div className="max-w-6xl mx-auto p-8 md:p-12 pb-40">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Executive Onboarding</span>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface tracking-tight">Document Upload</h1>
            <p className="text-on-surface-variant mt-4 text-lg max-w-2xl">
              Establish your sovereign identity. Provide the necessary legal credentials to unlock institutional deal execution capabilities.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-on-surface-variant text-sm font-medium mb-2">Step 4 of 5</span>
            <div className="w-48 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="bg-primary w-[80%] h-full transition-all"></div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Trust Score Widget */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold">Trust Score Preview</h3>
                <span className="material-symbols-outlined text-primary">security</span>
              </div>
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle className="text-surface-container-high" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="352" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black font-headline">20%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Current Rating</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed text-center italic">
                Upload mandatory documents to increase score to 85% and unlock high-limit transactions.
              </p>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
              <h4 className="font-headline text-sm font-bold text-primary mb-4 uppercase tracking-widest">Compliance Guide</h4>
              <ul className="space-y-4">
                {[
                  'Clear scan or digital original PDF',
                  'Valid until at least Dec 2024',
                  'Max file size 10MB per document',
                ].map((rule) => (
                  <li key={rule} className="flex gap-3 items-start">
                    <span className="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                    <span className="text-xs text-on-surface-variant font-medium">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Document Upload Zones */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentSlots.map((doc) => (
              <div
                key={doc.title}
                className={`bg-white p-6 rounded-xl group hover:bg-orange-50/20 transition-all duration-300 shadow-sm border border-outline-variant/20 ${
                  doc.span === 2 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-primary">{doc.icon}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${doc.badgeColor}`}>{doc.badge}</span>
                </div>

                {doc.span === 2 ? (
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                      <h3 className="font-headline text-lg font-bold mb-2">{doc.title}</h3>
                      <p className="text-xs text-on-surface-variant mb-4">{doc.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Secure Vault Storage</span>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 border-2 border-dashed border-outline-variant/30 rounded-xl p-10 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-colors bg-orange-50/20">
                      <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                      <span className="text-xs font-bold text-primary">Drop IEC Document Here</span>
                      <span className="text-[10px] text-on-surface-variant text-center">PDF, JPG, or PNG formats only.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-headline text-lg font-bold mb-2">{doc.title}</h3>
                    <p className="text-xs text-on-surface-variant mb-6">{doc.desc}</p>
                    <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-colors bg-orange-50/20">
                      <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                      <span className="text-xs font-bold text-primary">Drag &amp; Drop</span>
                      <span className="text-[10px] text-on-surface-variant">or click to browse</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <footer className="mt-16 flex justify-end gap-4">
          <button
            onClick={() => router.push('/onboarding/discovery')}
            className="px-8 py-4 rounded-full font-headline text-sm font-bold text-primary hover:bg-primary/5 transition-all"
          >
            Save Progress
          </button>
          <button
            onClick={() => router.push('/onboarding/verify')}
            className="px-10 py-4 rounded-full font-headline text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            Complete Upload Stage
          </button>
        </footer>

        {/* Floating HUD */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md px-8 py-4 rounded-full flex items-center gap-12 border border-white/20 shadow-2xl z-50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold font-headline text-on-surface">3 Documents Pending</span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
            <span className="text-xs text-on-surface-variant">Reviewing typically takes 2-4 hours.</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
