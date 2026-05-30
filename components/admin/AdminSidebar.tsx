"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Leads", href: "/admin/leads", icon: "person_search" },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: "history" },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <>
      {/* Logging Out Modal */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-xl animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold font-headline text-slate-900 mb-2">Logging out...</h3>
            <p className="text-slate-500 text-center">Please wait while we securely log you out of your account.</p>
          </div>
        </div>
      )}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/15 bg-surface-container-low dark:bg-slate-900/50 backdrop-blur-lg flex flex-col p-4 gap-2 z-50 font-headline text-sm font-medium">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-extrabold text-primary dark:text-white">Karm Executive</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-70">Admin Control</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-on-surface-variant hover:bg-surface-container-highest hover:translate-x-1"
                  }`}
              >
                <span className="material-symbols-outlined notranslate" translate="no" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
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
            <span className="material-symbols-outlined notranslate" translate="no">help_outline</span>
            <span>Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-on-surface-variant hover:text-error hover:translate-x-1 duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined notranslate" translate="no">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
