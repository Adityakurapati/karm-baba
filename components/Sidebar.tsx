'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { getNavigationForRole } from '@/lib/navigation-config';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export default function Sidebar({ open = true, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;

    const notifsRef = ref(database, 'notifications');
    const q = query(notifsRef, orderByChild('userId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        const count = list.filter((n: any) => n.type === 'message_received' && !n.read).length;
        setUnreadMessagesCount(count);
      } else {
        setUnreadMessagesCount(0);
      }
    }, (error) => {
      console.error('Error fetching unread message notifications:', error);
      setUnreadMessagesCount(0);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading || !user) {
    return null;
  }

  const sections = getNavigationForRole(user.role);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
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

      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-50 border-r border-slate-200 flex flex-col py-6 z-40 overflow-y-auto transition-all duration-300
          ${open ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 w-72'}
        `}
      >
        {/* Logo and Toggle */}
        <div className={`mb-6 flex flex-col ${open ? 'px-6' : 'md:px-2 px-6'} items-center`}>
          <Link href="/" className={`flex items-center w-full ${open ? 'gap-3' : 'md:justify-center gap-3'}`}>
            <Image
              src="/logo.png"
              alt="KARM BABA Logo"
              width={56}
              height={56}
              className="w-14 h-14 flex-shrink-0"
              priority
              unoptimized
            />
            {(open || true) && (
              <span className={`font-headline font-black text-primary text-xl ${!open ? 'md:hidden' : ''}`}>
                KARM BABA
              </span>
            )}
          </Link>

          {/* Toggle Button (Desktop Only) */}
          <button
            onClick={onToggle}
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm text-slate-500 hover:text-primary hover:border-primary transition-all mt-4 ${
              open ? 'self-end mr-2' : ''
            }`}
            title={open ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '18px' }}>
              {open ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}
            </span>
          </button>
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
                      className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all relative ${
                        isActive
                          ? 'text-primary bg-primary/10 border-r-2 border-primary'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${!open ? 'md:justify-center' : ''}`}
                      title={!open ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined notranslate" translate="no" style={{fontSize: '20px'}}>
                        {item.icon}
                      </span>
                      <span className={`font-headline ${!open ? 'md:hidden' : ''}`}>{item.label}</span>
                      
                      {/* Pulsing red dot for new messages */}
                      {item.href === '/messages' && unreadMessagesCount > 0 && (
                        <span className={`relative flex h-2.5 w-2.5 ${open ? 'ml-auto' : 'absolute right-2 top-2'}`}>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}

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
      </aside>
    </>
  );
}


