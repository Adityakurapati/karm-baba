'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface TopNavbarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export default function TopNavbar({ activeNav, setActiveNav }: TopNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  let navLinks = [
    { id: 'deals', label: 'Deals', href: '/deals' },
    { id: 'requirements', label: 'Requirements', href: '/requirements' },
    { id: 'network', label: 'Network', href: '/network' },
    { id: 'analytics', label: 'Analytics', href: '/analytics' },
  ];

  if (isAuthenticated && user) {
    if (user.role === 'buyer') {
      navLinks = [
        { id: 'requirements', label: 'Requirements', href: '/buyer/requirements' },
        { id: 'matches', label: 'Find Suppliers', href: '/buyer/matches' },
        { id: 'deals', label: 'My Deals', href: '/buyer/deals' },
        { id: 'marketplace', label: 'Marketplace', href: '/buyer/marketplace/products' },
      ];
    } else if (user.role === 'seller') {
      navLinks = [
        { id: 'products', label: 'My Products', href: '/seller/products' },
        { id: 'leads', label: 'Leads', href: '/seller/leads' },
        { id: 'deals', label: 'My Deals', href: '/seller/deals' },
        { id: 'marketplace', label: 'Marketplace', href: '/seller/marketplace' },
      ];
    } else if (user.role === 'admin') {
      navLinks = [
        { id: 'users', label: 'Users', href: '/admin/users' },
        { id: 'deals', label: 'Deals', href: '/admin/deals' },
        { id: 'analytics', label: 'Analytics', href: '/admin/analytics' },
        { id: 'requirements', label: 'Requirements', href: '/requirements' },
      ];
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
      <div className="px-6 py-4 max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="KARM BABA Logo"
            width={120}
            height={80}
            className="h-14 w-20"
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
                : 'text-on-surface-variant hover:text-primary'
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
                className="px-6 py-2 bg-slate-200 text-slate-700 font-headline font-bold rounded hover:bg-slate-300 transition-colors"
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
          className="md:hidden text-on-surface"
        >
          <span className="material-symbols-outlined notranslate" translate="no">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface p-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => {
                  setActiveNav(link.id);
                  setMobileMenuOpen(false);
                }}
                className="text-on-surface hover:text-primary font-headline font-bold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-outline-variant flex gap-2">
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
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-headline font-bold rounded text-center"
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
