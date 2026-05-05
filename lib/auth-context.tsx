'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, UserRole } from './types';
import { auth, database } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { ref, get, set, child, update } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
        return; // Skip Firebase listener if mock is active
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Realtime Database
        const dbRef = ref(database);
        try {
          const snapshot = await get(child(dbRef, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // Convert ISO strings back to Dates
            const formattedUser: User = {
              ...userData,
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
            setUser(formattedUser);
            
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            setSession({
              userId: formattedUser.id,
              email: formattedUser.email,
              role: formattedUser.role,
              companyName: formattedUser.company?.name || '',
              token: await firebaseUser.getIdToken(),
              expiresAt,
            });
          } else {
            console.error('User profile not found in database');
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
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
        
        return true;
      }

      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email,
        firstName,
        lastName,
        role,
        company: {
          id: `comp_${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          registrationNumber: '',
          industry: '',
          location: '',
          employees: 0,
          yearEstablished: new Date().getFullYear(),
        },
        phone: '',
        credibilityScore: 50,
        verificationStatus: 'pending',
        verificationBadges: [],
        riskLevel: 'medium',
        isOnboarded: false,
        onboardingStep: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database (serializing Dates)
      await set(ref(database, `users/${firebaseUser.uid}`), {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('mock_admin');
      }
      await signOut(auth);
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
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

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    canAccess,
    updateUserProfile,
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
