'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen bg-background">
      {/* Sidebar - Fixed Position */}
      <Sidebar />

      {/* Main Content Area - Offset by Sidebar Width */}
      <main className="ml-72 h-screen flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
