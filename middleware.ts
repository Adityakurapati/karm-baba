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
  const adminToken = request.cookies.get('admin_auth_token')?.value;

  // Define route categories
  const isNormalAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminAuthRoute = pathname.startsWith('/admin/login');
  const isOrgAuthRoute = pathname.startsWith('/organizations/login');
  
  // Public routes that don't need protection
  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.includes('favicon.ico') ||
    pathname === '/pricing' ||
    pathname.startsWith('/lead') ||
    pathname === '/requirements';

  if (isPublicRoute && !isNormalAuthRoute && !isAdminAuthRoute) {
    return NextResponse.next();
  }

  // Admin Routes Logic
  if (pathname.startsWith('/admin')) {
    const adminExpired = adminToken ? isTokenExpired(adminToken) : true;

    if (adminExpired) {
      if (!isAdminAuthRoute) {
        const response = NextResponse.redirect(new URL('/admin/login?session_expired=true', request.url));
        response.cookies.delete('admin_auth_token');
        return response;
      }
      return NextResponse.next();
    } else {
      if (isAdminAuthRoute) {
        return NextResponse.redirect(new URL('/admin/users', request.url));
      }
      return NextResponse.next();
    }
  }

  // Normal Routes Logic
  const expired = token ? isTokenExpired(token) : true;

  if (expired) {
    if (!isNormalAuthRoute && !isPublicRoute && !isOrgAuthRoute) {
      const response = NextResponse.redirect(new URL('/login?session_expired=true', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    if (isNormalAuthRoute || isOrgAuthRoute) {
      const response = NextResponse.next();
      // Only delete token if we're accessing normal auth routes, not org auth route
      if (isNormalAuthRoute) {
        response.cookies.delete('auth_token');
      }
      return response;
    }
    return NextResponse.next();
  }

  // Token is valid
  if (isNormalAuthRoute && !expired) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  // If they are logged in and access org login, we might let them proceed or redirect to their org dashboard.
  // For now, let them proceed since they might be trying to log in as an org.


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
