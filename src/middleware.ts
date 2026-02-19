import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateEnv } from './lib/env';

// Validate env on startup
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('noctuary_admin_session');

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect /admin to /admin/dashboard if logged in
  if (pathname === '/admin') {
    const adminSession = request.cookies.get('noctuary_admin_session');
    
    if (adminSession) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};