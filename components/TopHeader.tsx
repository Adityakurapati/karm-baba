'use client';

import { useState, useEffect, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

// Pleasant chime double-tone synthesizer using browser Web Audio API
const playNotificationChime = () => {
  if (typeof window === 'undefined') return;
  const isMuted = localStorage.getItem('notifications_muted') === 'true';
  if (isMuted) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Clean attack and exponential decay
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, start + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Ding at 880Hz (A5) followed immediately by a pleasant high chime at 1046.50Hz (C6)
    playTone(880, audioCtx.currentTime, 0.3);
    playTone(1046.50, audioCtx.currentTime + 0.12, 0.4);
  } catch (err) {
    console.warn('Unable to play audio notification chime:', err);
  }
};

export default function TopHeader({
  title = 'Dashboard',
  subtitle,
  searchPlaceholder = 'Search accounts, deals, or documents...',
}: TopHeaderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
        setShowProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mute states
  const [isMuted, setIsMuted] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState<number | null>(null);

  // Sync mute state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const muted = localStorage.getItem('notifications_muted') === 'true';
      setIsMuted(muted);
    }
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('notifications_muted', String(newMuted));
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const notifsRef = ref(database, 'notifications');
    const q = query(notifsRef, orderByChild('userId'), equalTo(user.id));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        // Sort by createdAt desc
        list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotifications(list);

        const newUnreadCount = list.filter((n: any) => !n.read).length;
        setPrevUnreadCount((prev) => {
          if (prev !== null && newUnreadCount > prev) {
            // Trigger beautiful synthesized chime
            playNotificationChime();
          }
          return newUnreadCount;
        });
      } else {
        setNotifications([]);
        setPrevUnreadCount(0);
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
      <div ref={containerRef} className="flex items-center gap-4 md:gap-6 ml-4 flex-shrink-0">
        {/* Mute/Unmute Toggle */}
        <button
          onClick={toggleMute}
          className="text-slate-500 hover:text-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-200/50 flex items-center justify-center"
          title={isMuted ? "Unmute notification sounds" : "Mute notification sounds"}
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '20px' }}>
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowProfileModal(false);
            }}
            className="text-slate-500 hover:text-slate-900 transition-colors relative p-1.5 rounded-full hover:bg-slate-200/50 flex items-center justify-center"
          >
            <span className="material-symbols-outlined notranslate" translate="no" style={{ fontSize: '20px' }}>notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
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
                  notifications.map((notif) => {
                    const content = (
                      <div className={`p-4 border-b border-outline-variant hover:bg-surface-container-low transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                        <p className="font-bold text-sm text-on-surface">{notif.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{notif.message}</p>
                        <p className="text-[10px] text-on-surface-light mt-2">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    );
                    
                    return notif.link ? (
                      <Link key={notif.id} href={notif.link} onClick={() => setShowNotifs(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notif.id}>{content}</div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileModal(!showProfileModal);
              setShowNotifs(false);
            }}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm select-none shadow-sm hover:scale-105 transition-transform" 
            title={user ? `${user.firstName} ${user.lastName}` : 'Profile'}
          >
            {user ? (
              `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
            ) : (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
          </button>
          
          {showProfileModal && user && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in p-4">
              <div className="flex items-center gap-3 mb-4 border-b border-outline-variant pb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline font-bold text-lg">
                  {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Role:</span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
                {user.company && user.company.name && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Company:</span>
                    <span className="font-medium truncate max-w-[120px]">{user.company.name}</span>
                  </div>
                )}
              </div>
              <Link 
                href="/settings" 
                onClick={() => setShowProfileModal(false)}
                className="w-full block text-center py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg text-sm font-bold transition-colors"
              >
                Go to Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

