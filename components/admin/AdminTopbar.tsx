"use client";

import React from "react";

interface AdminTopbarProps {
  title?: string;
  subtitle?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ title, subtitle }) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-surface/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-sm dark:shadow-none flex items-center justify-between px-8 h-16 font-headline font-semibold tracking-tight">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-primary dark:text-blue-100 uppercase">KARM BABA</span>
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm" translate="no">search</span>
          <input 
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="Search executive data..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95 duration-150 relative">
            <span className="material-symbols-outlined notranslate" translate="no">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined notranslate" translate="no">settings</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/15">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">Executive User</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter opacity-70">Admin Access</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden border border-primary/10">
            <img 
              alt="Executive User Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ5Dn20vuz5H5g4oel8GL1qdnAilJ6eQyqNrTXM8k9v2ttbCy_DANW0W0cThZ63rdCRHWKJHmkDFEoAaeSTNWykUvPo1gGPkd5mqGlp5jq8THLf0IfUh2mIdxTTBdao7x2YGirXtnqxsGdvzA93ZvEEeo9zxHstTAwK1cPaRa47_TuA57GC0FWX3QyLRA1OvCq1NvqoW1EXqsRVPyUQLfL128FG7PnQ0RP7uXcA4k_nNeKIhJ4PB_LXj4uo9jzlnw_uRCAmMjirg0"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
