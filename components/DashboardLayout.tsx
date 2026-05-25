'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  searchPlaceholder?: string;
  hideHeader?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title, 
  searchPlaceholder, 
  hideHeader = false 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Fixed Position */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main Content Area - Offset by Sidebar Width on desktop */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'md:ml-72' : 'md:ml-20'
      }`}>
        {!hideHeader && (
          <TopHeader 
            title={title} 
            searchPlaceholder={searchPlaceholder} 
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

