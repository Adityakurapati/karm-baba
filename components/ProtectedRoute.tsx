'use client';

import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[ProtectedRoute] Check:', { 
      path: typeof window !== 'undefined' ? window.location.pathname : '', 
      isAuthenticated, 
      isLoading, 
      userRole: user?.role, 
      isOnboarded: user?.isOnboarded,
      allowedRoles 
    });

    if (!isLoading && !isAuthenticated) {
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      console.log('[ProtectedRoute] Redirecting to login. AdminPath:', isAdminPath);
      router.push(isAdminPath ? '/admin/login' : '/login');
    } else if (!isLoading && isAuthenticated && user && !user.isOnboarded) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/onboarding')) {
        console.log('[ProtectedRoute] Redirecting to onboarding');
        router.push('/onboarding');
      }
    } else if (!isLoading && allowedRoles && user && !allowedRoles.includes(user.role)) {
      const target = user.role === 'admin' ? '/admin' : '/dashboard';
      console.log('[ProtectedRoute] Role mismatch. Redirecting to:', target);
      router.push(target);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
