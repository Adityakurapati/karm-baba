'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'person_add', label: 'Onboarding', href: '/onboarding' },
    { icon: 'person_search', label: 'Leads', href: '/leads' },
    { icon: 'handshake', label: 'Deals', href: '/deals' },
    { icon: 'group', label: 'Network', href: '/network' },
    { icon: 'trending_up', label: 'Analytics', href: '/analytics' },
    { icon: 'assignment', label: 'Requirements', href: '/requirements' },
    { icon: 'verified', label: 'Verification', href: '/verification' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-50 border-r border-slate-200 flex flex-col py-6 z-40 overflow-y-auto transition-all duration-300
          ${open ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 w-72'}
        `}
      >
        {/* Logo */}
        <div className={`mb-10 ${open ? 'px-6' : 'md:px-2 px-6'}`}>
          <Link href="/" className={`flex items-center ${open ? 'gap-3' : 'md:justify-center gap-3'}`}>
            <Image
              src="/logo.png"
              alt="KARM BABA Logo"
              width={56}
              height={56}
              className="w-14 h-14"
              priority
            />
            {(open || true) && (
              <span className={`font-headline font-black text-primary text-xl ${!open ? 'md:hidden' : ''}`}>
                KARM BABA
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10 border-r-2 border-primary'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${!open ? 'md:justify-center' : ''}`}
                title={!open ? item.label : undefined}
              >
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>
                  {item.icon}
                </span>
                <span className={`font-headline ${!open ? 'md:hidden' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`mt-auto space-y-6 ${open ? 'px-6' : 'md:px-2 px-6'}`}>
          <Link
            href="/deals/new"
            onClick={onClose}
            className={`w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all inline-block text-center ${
              !open ? 'md:px-2' : ''
            }`}
            title={!open ? "New Deal" : undefined}
          >
            {open ? 'New Deal' : <span className="md:inline hidden">+</span>}
            {!open && <span className="md:hidden">New Deal</span>}
          </Link>
          <div className="space-y-1">
            <Link
              href="#help"
              className={`flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 transition-all text-sm ${
                !open ? 'md:justify-center' : ''
              }`}
              title={!open ? "Help Center" : undefined}
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>help</span>
              <span className={!open ? 'md:hidden' : ''}>Help Center</span>
            </Link>
            <Link
              href="/logout"
              className={`flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 transition-all text-sm ${
                !open ? 'md:justify-center' : ''
              }`}
              title={!open ? "Logout" : undefined}
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
              <span className={!open ? 'md:hidden' : ''}>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}