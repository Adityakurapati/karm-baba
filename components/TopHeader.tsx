'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

export default function TopHeader({
  title = 'Dashboard',
  subtitle,
  searchPlaceholder = 'Search accounts, deals, or documents...',
}: TopHeaderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!user) return;

    const notifsRef = ref(database, 'notifications');
    const q = query(notifsRef, orderByChild('userId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        // Sort by createdAt desc
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const markAllRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const updates: any = {};
      notifications.forEach(notif => {
        if (!notif.read) {
          updates[`notifications/${notif.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <header className="bg-slate-50/80 backdrop-blur-md flex justify-between items-center h-14 md:h-16 px-4 md:px-8 border-b border-slate-200/20">
      <div className="relative w-full md:w-96">
        <span className="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" translate="no">
          search
        </span>
        <input
          className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
          placeholder={searchPlaceholder}
          type="text"
        />
      </div>
      <div className="flex items-center gap-4 md:gap-6 ml-4 flex-shrink-0">
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="text-slate-500 hover:text-slate-900 transition-colors relative"
          >
            <span className="material-symbols-outlined notranslate" translate="no">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                <span className="font-bold text-on-surface">Notifications</span>
                <span 
                  onClick={markAllRead}
                  className="text-xs text-primary font-bold cursor-pointer hover:underline"
                >
                  Mark all as read
                </span>
              </div>
              <div className="max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors ${!notif.read ? 'bg-primary-ultra-light' : ''}`}>
                      <p className="font-bold text-sm text-on-surface">{notif.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{notif.message}</p>
                      <p className="text-[10px] text-on-surface-light mt-2">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className="text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
          <span className="material-symbols-outlined notranslate" translate="no">help</span>
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm select-none" title={user ? `${user.firstName} ${user.lastName}` : 'Profile'}>
          {user ? (
            `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
          ) : (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          )}
        </div>
      </div>
    </header>
  );
}
