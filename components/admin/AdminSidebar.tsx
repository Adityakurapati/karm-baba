"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Pipeline", href: "/admin/pipeline", icon: "analytics" },
  { label: "RM Performance", href: "/admin/performance", icon: "query_stats" },
  { label: "Lead Scoring", href: "/admin/leads", icon: "ads_click" },
  { label: "Reports", href: "/admin/reports", icon: "assessment" },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/15 bg-surface-container-low dark:bg-slate-900/50 backdrop-blur-lg flex flex-col p-4 gap-2 z-50 font-headline text-sm font-medium">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-extrabold text-primary dark:text-white">Karmic Executive</h1>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-70">Admin Control</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:translate-x-1"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-outline-variant/15 pt-4 space-y-1">
        <Link 
          href="/admin/support" 
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest hover:translate-x-1 duration-200 rounded-lg"
        >
          <span className="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </Link>
        <Link 
          href="/logout" 
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-error hover:translate-x-1 duration-200 rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};
