import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight Edge-compatible JWT expiration checker
function isTokenExpired(token: string): boolean {
  if (token === 'mock_token') return false;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    // Replace base64 URL safe characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 (atob is available in Edge Runtime)
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    // JWT exp is in seconds, Date.now() is in milliseconds
    const expirationTimeMs = payload.exp * 1000;
    
    // Add a 5 minute buffer to prevent edge cases
    return Date.now() >= (expirationTimeMs - 300000);
  } catch (e) {
    console.error('[Middleware] Token decode error:', e);
    return true; // Assume expired/invalid if decoding fails
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Define route categories
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin/login');
  
  // Public routes that don't need protection
  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.includes('favicon.ico') ||
    pathname === '/pricing' ||
    pathname.startsWith('/lead') ||
    pathname === '/requirements'; // The public requirements board

  // If it's a public route, just let it pass
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // 1. Handle missing token
  if (!token) {
    if (!isAuthRoute && !isPublicRoute) {
      // Redirect to login if trying to access protected route without token
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Handle token expiration
  const expired = isTokenExpired(token);
  
  if (expired) {
    if (!isAuthRoute && !isPublicRoute) {
      // Token is expired, clear the cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login?session_expired=true', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    // If they are on an auth route with an expired token, delete the cookie and let them log in
    if (isAuthRoute) {
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }
    return NextResponse.next();
  }

  // 3. Handle authenticated users trying to access auth pages
  if (isAuthRoute && !expired) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Token is valid, allow access to protected routes
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image files (.png, .jpg, .svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
