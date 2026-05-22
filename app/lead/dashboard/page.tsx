'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, get, push, set, serverTimestamp } from 'firebase/database';
import { User, PlatformLead } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

const AVAILABLE_CATEGORIES = [
  "Technology",
  "Real Estate",
  "Manufacturing",
  "Finance",
  "Consulting",
  "Pharmacy",
  "Agriculture",
  "Other"
];

// Free notification sound
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function LeadDashboard() {
  const router = useRouter();
  const [lead, setLead] = useState<PlatformLead | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  
  const [connections, setConnections] = useState<Record<string, 'pending' | 'approved'>>({});
  const prevConnectionsRef = useRef<Record<string, string>>({});
  
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, boolean>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Session check & fetch lead
  useEffect(() => {
    const sessionStr = localStorage.getItem('lead_session');
    if (!sessionStr) {
      router.push('/lead/login');
      return;
    }
    const session = JSON.parse(sessionStr);
    
    // Fetch full lead data
    const leadRef = ref(database, `leads/${session.id}`);
    get(leadRef).then((snapshot) => {
      if (snapshot.exists()) {
        const leadData = snapshot.val() as PlatformLead;
        leadData.id = session.id;
        setLead(leadData);
      } else {
        localStorage.removeItem('lead_session');
        router.push('/lead/login');
      }
    });

    // Initialize audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    
    // Load mute preference
    const savedMute = localStorage.getItem('lead_muted');
    if (savedMute === 'true') setIsMuted(true);
  }, [router]);

  // 2. Fetch assigned users
  useEffect(() => {
    if (!lead) return;

    const usersRef = ref(database, 'users');
    get(usersRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let usersArray = Object.keys(data).map(key => ({ ...data[key], id: key })) as User[];
        
        // Filter out non-buyers/sellers
        usersArray = usersArray.filter(u => u.role === 'buyer' || u.role === 'seller');

        // Apply assignment logic
        if (lead.assignmentType === 'users' && lead.assignedUsers) {
          usersArray = usersArray.filter(u => lead.assignedUsers!.includes(u.id));
        } else if (lead.assignmentType === 'categories' && lead.assignedCategories) {
          usersArray = usersArray.filter(u => u.category && lead.assignedCategories!.includes(u.category));
        }
        // if 'all', keep all buyers/sellers

        setAssignedUsers(usersArray);
        setFilteredUsers(usersArray);
      }
    });
  }, [lead]);

  // 3. Category Filter logic
  useEffect(() => {
    if (categoryFilter === 'All') {
      setFilteredUsers(assignedUsers);
    } else {
      setFilteredUsers(assignedUsers.filter(u => u.category === categoryFilter));
    }
  }, [categoryFilter, assignedUsers]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    isMutedRef.current = newMute;
    localStorage.setItem('lead_muted', String(newMute));
  };

  const playNotificationSound = () => {
    if (!isMuted && audioRef.current) {
      // Create a new audio instance to allow overlapping sounds if they happen fast
      const sound = new Audio(NOTIFICATION_SOUND_URL);
      sound.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // 4. Listen to connections for requests
  useEffect(() => {
    if (!lead) return;
    const connectionsRef = ref(database, 'lead_connections');
    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newConns: Record<string, 'pending' | 'approved'> = {};
        let playSound = false;
        
        Object.keys(data).forEach(key => {
          if (key.startsWith(`${lead.id}_`)) {
            const userId = key.split('_')[1];
            const status = data[key].status;
            
            if (status === 'pending' && prevConnectionsRef.current[userId] !== 'pending') {
              playSound = true;
            }
            
            newConns[userId] = status;
          }
        });
        
        if (playSound && !initialLoadRef.current && !isMutedRef.current) {
          if (audioRef.current) {
            const sound = new Audio(NOTIFICATION_SOUND_URL);
            sound.play().catch(e => console.log('Audio play failed:', e));
          }
        }
        
        prevConnectionsRef.current = newConns;
        setConnections(newConns);
      }
    });
    return () => unsubscribe();
  }, [lead]);

  // 4. Listen to all messages for unread notifications
  useEffect(() => {
    if (!lead || assignedUsers.length === 0) return;

    const unsubscribes: (() => void)[] = [];
    const newUnread: Record<string, boolean> = {};

    assignedUsers.forEach(user => {
      const threadId = `${lead.id}_${user.id}`;
      const msgRef = ref(database, `lead_messages/${threadId}`);
      
      const unsub = onValue(msgRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const msgs = Object.values(data) as any[];
          msgs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          
          if (msgs.length > 0) {
            const lastMsg = msgs[0];
            // If the last message is from the user, and we are not currently viewing their thread
            if (lastMsg.senderId === user.id) {
              if (selectedUserId !== user.id) {
                setUnreadCounts(prev => ({ ...prev, [user.id]: true }));
                
                // Play sound if not initial load
                if (!initialLoadRef.current) {
                  playNotificationSound();
                }
              }
            }
          }
        }
      });
      unsubscribes.push(unsub);
    });

    // After setting up listeners, mark initial load complete
    setTimeout(() => { initialLoadRef.current = false; }, 2000);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [lead, assignedUsers, selectedUserId, isMuted]); // Note: includes isMuted to capture the latest state in the closure, though using a ref for isMuted is sometimes better

  // 5. Load active conversation
  useEffect(() => {
    if (!lead || !selectedUserId) {
      setMessages([]);
      return;
    }

    const threadId = `${lead.id}_${selectedUserId}`;
    const msgRef = ref(database, `lead_messages/${threadId}`);
    
    // Clear unread for this user
    setUnreadCounts(prev => ({ ...prev, [selectedUserId]: false }));

    const unsubscribe = onValue(msgRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgs = Object.values(data) as any[];
        msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // Ascending for display
        setMessages(msgs);
        
        // Clear unread again just in case a new message arrived while looking
        setUnreadCounts(prev => ({ ...prev, [selectedUserId]: false }));
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [lead, selectedUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !lead || !selectedUserId) return;

    try {
      const threadId = `${lead.id}_${selectedUserId}`;
      const msgRef = push(ref(database, `lead_messages/${threadId}`));
      
      const msgData = {
        id: msgRef.key,
        senderId: lead.id,
        senderName: lead.name,
        senderRole: 'lead',
        content: messageText,
        createdAt: serverTimestamp(),
      };

      await set(msgRef, msgData);
      setMessageText('');

      // Auto-approve if not already approved
      if (connections[selectedUserId] !== 'approved') {
        await set(ref(database, `lead_connections/${threadId}`), {
          status: 'approved',
          updatedAt: serverTimestamp()
        });
      }

      // Create notification for the user
      const notificationsRef = push(ref(database, 'notifications'));
      await set(notificationsRef, {
        id: notificationsRef.key,
        userId: selectedUserId,
        title: 'New Message from Platform Lead',
        message: `${lead.name} sent you a message`,
        type: 'message_received',
        link: `/messages?tab=leads&leadId=${lead.id}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleApprove = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const threadId = `${lead!.id}_${userId}`;
      await set(ref(database, `lead_connections/${threadId}`), {
        status: 'approved',
        updatedAt: serverTimestamp()
      });

      // Notify user
      const notificationsRef = push(ref(database, 'notifications'));
      await set(notificationsRef, {
        id: notificationsRef.key,
        userId: userId,
        title: 'Connection Approved',
        message: `${lead!.name} approved your connection request.`,
        type: 'connection_approved',
        link: `/messages?tab=leads&leadId=${lead!.id}`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lead_session');
    router.push('/lead/login');
  };

  if (!lead) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const selectedUser = assignedUsers.find(u => u.id === selectedUserId);

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="h-16 border-b border-outline-variant/30 flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" unoptimized />
          <h1 className="font-headline font-black text-xl text-on-surface">Lead Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-outline-variant/30 pr-6">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface leading-tight">{lead.name}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Platform Lead</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-headline">
              {lead.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <button 
            onClick={toggleMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-error/10 text-error' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
          >
            <span className="material-symbols-outlined notranslate text-[20px]" translate="no">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined notranslate text-[18px]" translate="no">logout</span>
            Exit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Users List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest shrink-0">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/50">
            <h2 className="text-sm font-bold font-headline text-on-surface mb-3 uppercase tracking-wider">Assigned Contacts</h2>
            
            {/* Category Filter */}
            <div className="relative">
              <span className="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50" translate="no">filter_list</span>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/50 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {AVAILABLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined notranslate text-4xl opacity-30 mb-2" translate="no">group_off</span>
                <p className="text-sm font-medium">No contacts found in this category.</p>
              </div>
            ) : (
              filteredUsers.map(user => {
                const hasUnread = unreadCounts[user.id];
                const isSelected = selectedUserId === user.id;
                
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                        : 'hover:bg-surface-container border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        user.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`font-bold text-sm truncate ${hasUnread ? 'text-on-surface' : 'text-on-surface/90'}`}>
                          {user.firstName} {user.lastName}
                        </p>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          user.role === 'buyer' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{user.company.name}</p>
                      <p className="text-[10px] text-on-surface-variant/70 truncate mt-0.5">{user.category || 'No Category'}</p>
                    </div>
                    {connections[user.id] === 'pending' && (
                      <button 
                        onClick={(e) => handleApprove(user.id, e)}
                        className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full hover:bg-primary-dark transition-colors shadow-sm ml-2 shrink-0"
                      >
                        Approve
                      </button>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    selectedUser.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold font-headline text-on-surface">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      {selectedUser.company.name} • {selectedUser.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors" title="Contact Info">
                    <span className="material-symbols-outlined notranslate text-[18px]" translate="no">info</span>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                    <span className="material-symbols-outlined notranslate text-6xl mb-4" translate="no">forum</span>
                    <p className="font-medium">No messages yet. Send a message to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === lead.id;
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl ${
                            isMe 
                              ? 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/10' 
                              : 'bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/20'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-on-surface-variant mt-1 font-medium px-1">
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-outline-variant/30">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-3 max-w-5xl mx-auto"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Message ${selectedUser.firstName}...`}
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 px-5 py-4 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined notranslate text-[20px]" translate="no">send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest/50 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined notranslate text-4xl" translate="no">chat</span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Your Conversations</h2>
              <p className="text-on-surface-variant font-medium">Select a contact from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
