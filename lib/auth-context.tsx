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
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updates: any = { ...data };
      updates.updatedAt = new Date().toISOString();
      if (data.createdAt) updates.createdAt = data.createdAt.toISOString();
      
      // Handle nested serialization if necessary
      if (data.verificationBadges) {
        updates.verificationBadges = data.verificationBadges.map(b => ({
          ...b,
          issuedDate: b.issuedDate.toISOString(),
          expiryDate: b.expiryDate?.toISOString(),
        }));
      }

      await update(ref(database, `users/${user.id}`), updates);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
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
