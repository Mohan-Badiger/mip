import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const isProd = process.env.NODE_ENV === 'production';

  // ── Security Headers ──────────────────────────────────────────────
  if (isProd) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: http:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isProd ? 'upgrade-insecure-requests;' : ''}
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // ── CORS ──────────────────────────────────────────────────────────
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // ── Server-side Auth Gate for Admin Pages ─────────────────────────
  // Protect all admin page routes (not API routes — those have their own withAuth)
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login');
  const isPublicAsset = pathname.startsWith('/_next/') || pathname.startsWith('/favicon');

  if (!isApiRoute && !isLoginPage && !isPublicAsset) {
    // Check for admin access token cookie
    const cookie = request.cookies.get('adminAccessToken');
    if (!cookie || !cookie.value) {
      // Redirect unauthenticated users to login page
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.).*)',
  ],
};
