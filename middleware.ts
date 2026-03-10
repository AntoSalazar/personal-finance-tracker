import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/transactions', '/accounts', '/debts', '/statistics', '/categories', '/crypto', '/settings'];
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for session cookie (BetterAuth uses these cookie names)
  const sessionCookie =
    req.cookies.get('finance-app.session_token') ||
    req.cookies.get('__Secure-finance-app.session_token');

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users to login
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/ (API routes handle their own auth)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/).*)',
  ],
};
