'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getNavigationForRole } from '@/lib/navigation-config';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  const sections = getNavigationForRole(user.role);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
              unoptimized
            />
            {(open || true) && (
              <span className={`font-headline font-black text-primary text-xl ${!open ? 'md:hidden' : ''}`}>
                KARM BABA
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 px-4">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h3 className={`text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ${!open ? 'md:hidden' : ''}`}>
                  {section.title}
                </h3>
              )}
              <div className="space-y-2">
                {section.items.map((item) => {
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
                      {item.badge && !open && (
                        <span className="absolute right-2 top-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`mt-auto space-y-4 border-t border-slate-200 pt-4 ${open ? 'px-6' : 'md:px-2 px-6'}`}>
          {/* User Profile */}
          <div className={`flex items-center gap-3 p-3 rounded-lg bg-slate-100 ${!open ? 'md:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-600 capitalize">{user.role}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm ${
                !open ? 'md:justify-center' : ''
              }`}
              title={!open ? "Logout" : undefined}
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
              <span className={!open ? 'md:hidden' : ''}>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
