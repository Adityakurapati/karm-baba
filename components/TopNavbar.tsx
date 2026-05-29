'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface TopNavbarProps {
  activeNav?: string;
  setActiveNav?: (nav: string) => void;
}

export default function TopNavbar({ activeNav = '', setActiveNav = () => {} }: TopNavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  let navLinks = [
    { id: 'deals', label: 'Deals', href: '/deals' },
    { id: 'requirements', label: 'Requirements', href: '/requirements' },
    { id: 'network', label: 'Network', href: '/network' },
    { id: 'analytics', label: 'Analytics', href: '/analytics' },
  ];

  if (isAuthenticated && user) {
    if (user.role === 'super_admin') {
      navLinks = [
        { id: 'dashboard', label: 'Dashboard', href: '/admin' },
        { id: 'organizations', label: 'Organizations', href: '/admin/organizations' },
        { id: 'users', label: 'Users', href: '/admin/users' },
        { id: 'approvals', label: 'Pending', href: '/admin/organizations/pending-approvals' },
      ];
    } else if (user.role === 'admin') {
      navLinks = [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'business', label: 'Business Profile', href: '/business/create' },
      ];
    } else if (user.role === 'vendor_user' || user.role === 'seller') {
      navLinks = [
        { id: 'products', label: 'Products', href: '/seller/products' },
        { id: 'deals', label: 'Deals', href: '/seller/deals' },
      ];
    } else if (user.role === 'buyer') {
      navLinks = [
        { id: 'requirements', label: 'Requirements', href: '/buyer/requirements' },
        { id: 'matches', label: 'Suppliers', href: '/buyer/matches' },
        { id: 'deals', label: 'Deals', href: '/buyer/deals' },
      ];
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-outline-variant dark:border-slate-800 shadow-sm dark:shadow-slate-950/50">
      <div className="px-6 py-4 max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="KARM BABA Logo"
            width={120}
            height={80}
            className="h-14 w-20 dark:brightness-90"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setActiveNav(link.id)}
              className={`font-headline font-bold text-sm transition-colors ${activeNav === link.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-6 py-2 text-primary font-headline font-bold hover:bg-primary hover:text-white rounded transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-headline font-bold rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 text-primary font-headline font-bold hover:bg-primary hover:text-white rounded transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-primary text-white font-headline font-bold rounded hover:bg-primary-dark transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-on-surface dark:text-white"
        >
          <span className="material-symbols-outlined notranslate" translate="no">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => {
                  setActiveNav(link.id);
                  setMobileMenuOpen(false);
                }}
                className="text-on-surface dark:text-white hover:text-primary font-headline font-bold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-outline-variant dark:border-slate-800 flex gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex-1 px-4 py-2 text-primary font-headline font-bold rounded border border-primary text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-headline font-bold rounded text-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex-1 px-4 py-2 text-primary font-headline font-bold rounded border border-primary text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 px-4 py-2 bg-primary text-white font-headline font-bold rounded text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}