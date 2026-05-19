'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background">
      {/* Sidebar - Fixed Position */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-slate-200 h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined notranslate" translate="no">menu</span>
        </button>
        <span className="ml-3 font-headline font-bold text-primary text-lg">KARM BABA</span>
      </div>

      {/* Main Content Area - Offset by Sidebar Width on desktop */}
      <main className={`h-screen flex flex-col overflow-hidden transition-all duration-300 pt-14 md:pt-0 ${
        sidebarOpen ? 'md:ml-72' : 'md:ml-20'
      }`}>
        {children}
      </main>
    </div>
  );
}
