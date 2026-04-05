'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open?: boolean;
}

export default function Sidebar({ open = true }: SidebarProps) {
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
    <aside 
      className={`fixed left-0 top-0 h-screen bg-slate-50 border-r border-slate-200 flex flex-col py-6 z-40 overflow-y-auto transition-all duration-300 ${
        open ? 'w-72' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className={`mb-10 ${open ? 'px-6' : 'px-2'}`}>
        <Link href="/" className={`flex items-center ${open ? 'gap-3' : 'justify-center'}`}>
          <Image
            src="/logo.png"
            alt="KARM BABA Logo"
            width={56}
            height={56}
            className="w-14 h-14"
            priority
          />
          {open && (
            <span className="font-headline font-black text-primary text-xl">
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
              className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-primary bg-primary/10 border-r-2 border-primary'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${!open && 'justify-center'}`}
              title={!open ? item.label : undefined}
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>
                {item.icon}
              </span>
              {open && <span className="font-headline">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`mt-auto space-y-6 ${open ? 'px-6' : 'px-2'}`}>
        <Link
          href="/deals/new"
          className={`w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all inline-block text-center ${
            !open && 'px-2'
          }`}
          title={!open ? "New Deal" : undefined}
        >
          {open ? 'New Deal' : '+'}
        </Link>
        <div className="space-y-1">
          <Link
            href="#help"
            className={`flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 transition-all text-sm ${
              !open && 'justify-center'
            }`}
            title={!open ? "Help Center" : undefined}
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>help</span>
            {open && <span>Help Center</span>}
          </Link>
          <Link
            href="/logout"
            className={`flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 transition-all text-sm ${
              !open && 'justify-center'
            }`}
            title={!open ? "Logout" : undefined}
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
            {open && <span>Logout</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}