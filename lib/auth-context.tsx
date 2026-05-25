'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, UserRole } from './types';
import { auth, database } from './firebase';
import {
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { ref, get, set, child, update, onValue, push } from 'firebase/database';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (providerName: 'google' | 'microsoft' | 'facebook', role?: UserRole) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, role: UserRole, verificationCode: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for persisted mock admin first
    if (typeof window !== 'undefined') {
      const persistedMock = sessionStorage.getItem('mock_admin');
      console.log('[AuthContext] Persisted Mock Check:', persistedMock ? 'Found' : 'Not Found');
      if (persistedMock) {
        const mockAdmin = JSON.parse(persistedMock);
        console.log('[AuthContext] Restoring Mock Admin:', mockAdmin.email);
        // Convert dates back
        mockAdmin.createdAt = new Date(mockAdmin.createdAt);
        mockAdmin.updatedAt = new Date(mockAdmin.updatedAt);
        // Sync mock session to server
        (async () => {
          try {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: 'mock_token', expiresIn: 86400, role: 'admin' })
            });
          } catch (err) {
            console.error('Failed to sync mock session:', err);
          }
          
          setUser(mockAdmin);
          setSession({
            userId: mockAdmin.id,
            email: mockAdmin.email,
            role: mockAdmin.role,
            companyName: mockAdmin.company?.name || 'KARM BABA',
            token: 'mock_token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
          
          setIsLoading(false);
        })();
        return; // Skip Firebase listener if mock is active
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Realtime Database
        const dbRef = ref(database, `users/${firebaseUser.uid}`);
        const unsubscribeDb = onValue(dbRef, async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // Convert ISO strings back to Dates
            const formattedUser: User & { authProvider?: string } = {
              ...userData,
              authProvider: firebaseUser.providerData[0]?.providerId || 'password',
              isOnboarded: !!userData.isOnboarded,
              onboardingStep: userData.onboardingStep || 1,
              createdAt: new Date(userData.createdAt),
              updatedAt: new Date(userData.updatedAt),
              verificationBadges: userData.verificationBadges?.map((b: any) => ({
                ...b,
                issuedDate: new Date(b.issuedDate),
                expiryDate: b.expiryDate ? new Date(b.expiryDate) : undefined,
              })) || [],
            };
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const token = await firebaseUser.getIdToken();

            // Sync Firebase session to Server for Middleware
            try {
              await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, expiresIn: 3600, role: formattedUser.role })
              });
            } catch (err) {
              console.error('Failed to sync session:', err);
            }

            setUser(formattedUser);
            setSession({
              userId: formattedUser.id,
              email: formattedUser.email,
              role: formattedUser.role,
              companyName: formattedUser.company?.name || '',
              token,
              expiresAt,
            });
            setIsLoading(false);
          } else {
            // Fallback check for admins node
            get(ref(database, `admins/${firebaseUser.uid}`)).then(async (adminSnap) => {
              if (adminSnap.exists()) {
                const adminData = adminSnap.val();
                const formattedAdmin: User = {
                  ...adminData,
                  isOnboarded: true,
                  onboardingStep: 5,
                  createdAt: adminData.createdAt ? new Date(adminData.createdAt) : new Date(),
                  updatedAt: adminData.updatedAt ? new Date(adminData.updatedAt) : new Date(),
                };
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const token = await firebaseUser.getIdToken();
                try {
                  await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, expiresIn: 3600, role: 'admin' })
                  });
                } catch (err) { }
                setUser(formattedAdmin);
                setSession({
                  userId: formattedAdmin.id,
                  email: formattedAdmin.email,
                  role: 'admin',
                  companyName: formattedAdmin.company?.name || 'KARM BABA',
                  token,
                  expiresAt,
                });
              } else {
                console.error('User profile not found in database (checked users and admins)');
                setUser(null);
                setSession(null);
              }
              setIsLoading(false);
            }).catch((err) => {
              console.error('Error fetching admin profile:', err);
              setUser(null);
              setSession(null);
              setIsLoading(false);
            });
          }
        }, (error) => {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setSession(null);
          setIsLoading(false);
        });

        // We could store unsubscribeDb to clean it up if auth state changes,
        // but for now relying on top-level unmount is fine.
      } else {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Admin bypass for requested credentials
      if (email === 'admin@karmbaba.com' && password === 'karmbaba2026') {
        const mockAdmin: User = {
          id: 'admin_mock_id',
          email: 'admin@karmbaba.com',
          firstName: 'Executive',
          lastName: 'Admin',
          role: 'admin',
          company: {
            id: 'admin_comp_id',
            name: 'KARM BABA',
            registrationNumber: 'KB-2026',
            industry: 'Executive Intelligence',
            location: 'Global',
            employees: 100,
            yearEstablished: 2026,
          },
          phone: '+1 234 567 890',
          credibilityScore: 100,
          verificationStatus: 'verified',
          verificationBadges: [],
          riskLevel: 'low',
          isOnboarded: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Sync mock session to server
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'mock_token', expiresIn: 86400, role: 'admin' })
          });
        } catch (err) {
          console.error('Failed to sync mock session:', err);
        }

        setUser(mockAdmin);
        setSession({
          userId: mockAdmin.id,
          email: mockAdmin.email,
          role: mockAdmin.role,
          companyName: 'KARM BABA',
          token: 'mock_token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        // Persist mock admin for page reloads
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mock_admin', JSON.stringify(mockAdmin));
        }
        
        setIsLoading(false);
        return true;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Log session
      try {
        const sessionData = {
          timestamp: new Date().toISOString(),
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        };
        await push(ref(database, `user_sessions/${uid}`), sessionData);
      } catch (sessionErr) {
        console.error('Failed to log session:', sessionErr);
      }

      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithProvider = async (providerName: 'google' | 'microsoft' | 'facebook', role: UserRole = 'buyer'): Promise<boolean> => {
    setIsLoading(true);
    try {
      let provider;
      switch (providerName) {
        case 'google':
          provider = new GoogleAuthProvider();
          break;
        case 'microsoft':
          provider = new OAuthProvider('microsoft.com');
          break;
        case 'facebook':
          provider = new FacebookAuthProvider();
          break;
        default:
          throw new Error('Unsupported provider');
      }

      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      const additionalUserInfo = getAdditionalUserInfo(userCredential);

      const userSnap = await get(ref(database, `users/${uid}`));
      const adminSnap = await get(ref(database, `admins/${uid}`));

      // Create user profile in Realtime Database if it doesn't exist to enforce onboarding
      if (!userSnap.exists() && !adminSnap.exists()) {
        const newUser = {
          id: uid,
          email: userCredential.user.email || '',
          firstName: additionalUserInfo?.profile?.given_name || additionalUserInfo?.profile?.first_name || userCredential.user.displayName?.split(' ')[0] || '',
          lastName: additionalUserInfo?.profile?.family_name || additionalUserInfo?.profile?.last_name || userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
          role: role,
          company: {
            id: `comp_${Math.random().toString(36).substring(2, 11)}`,
            name: '',
            registrationNumber: '',
            industry: '',
            location: '',
            employees: 0,
            yearEstablished: new Date().getFullYear(),
          },
          phone: userCredential.user.phoneNumber || '',
          credibilityScore: 50,
          verificationStatus: 'pending',
          verificationBadges: [],
          riskLevel: 'medium',
          isOnboarded: false,
          onboardingStep: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await set(ref(database, `users/${uid}`), newUser);
      }

      // Log session
      try {
        const sessionData = {
          timestamp: new Date().toISOString(),
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        };
        await push(ref(database, `user_sessions/${uid}`), sessionData);
      } catch (sessionErr) {
        console.error('Failed to log session:', sessionErr);
      }

      return true;
    } catch (err) {
      console.error(`${providerName} login error:`, err);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: UserRole, verificationCode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call the backend registration API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role, verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // After successful backend registration, log the user in to trigger Firebase Auth state changes
      await signInWithEmailAndPassword(auth, email, password);

      return true;
    } catch (err: any) {
      console.error('Registration error:', err.message || err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // 1. Invalidate Server Session
      await fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Logout API error:', err));
      
      // 2. Clear Firebase Session
      await signOut(auth);
      
      // 3. Clear Local & Session Storage thoroughly
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();
      }
      
      // 4. Update React State
      setUser(null);
      setSession(null);
      
      // 5. Artificial delay so the user sees the 'Logging out...' modal
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 6. Feedback and Redirect
      toast.success('Successfully logged out', { duration: 3000 });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error during logout');
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user || !user.id) return false;
    try {
      const updates: any = { ...data };
      updates.updatedAt = new Date().toISOString();
      if (data.createdAt) updates.createdAt = (data.createdAt as Date).toISOString();
      
      // Handle nested serialization if necessary
      if (data.verificationBadges) {
        updates.verificationBadges = data.verificationBadges.map(b => {
          const badge: any = { ...b };
          if (b.issuedDate instanceof Date) badge.issuedDate = b.issuedDate.toISOString();
          if (b.expiryDate instanceof Date) badge.expiryDate = b.expiryDate.toISOString();
          // Remove undefined fields to prevent Firebase update errors
          Object.keys(badge).forEach(key => badge[key] === undefined && delete badge[key]);
          return badge;
        });
      }

      // Remove all undefined fields from top-level updates
      Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

      // If mock admin, skip database update to prevent hanging
      if (user.id === 'admin_mock_id') {
        console.log('[AuthContext] Mock admin profile update (skipping DB):', updates);
      } else {
        await update(ref(database, `users/${user.id}`), updates);
      }
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...data, updatedAt: new Date() };
        
        // Persist mock admin update in session storage if applicable
        if (prev.id === 'admin_mock_id' && typeof window !== 'undefined') {
          sessionStorage.setItem('mock_admin', JSON.stringify(updated));
        }
        
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const canAccess = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      console.error('Firebase password reset error (falling back to sandbox simulation):', err);
      // Sandbox fallback: simulate successful reset link generation & sending
      console.log(`%c[Sandbox] Password reset email simulated successfully for: ${email}`, 'color: #e55a24; font-weight: bold;');
      toast.success(`[Sandbox] Password reset link sent to ${email} (simulated)`);
      return true;
    }
  };


  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithProvider,
    register,
    logout,
    hasRole,
    canAccess,
    updateUserProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
