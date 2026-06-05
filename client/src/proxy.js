import { NextResponse } from 'next/server';

export function proxy(request) {
  const response = NextResponse.next();
  const isProd = process.env.NODE_ENV === 'production';
  const host = request.headers.get('host') || '';
  const isDev = !isProd || host.includes('localhost') || host.includes('127.0.0.1') || host.includes('192.168.');
  const unsafeEval = isDev ? "'unsafe-eval'" : "";

  // ── Security Headers ──────────────────────────────────────────────
  if (isProd) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Content Security Policy (CSP) Definition
  // SECURITY: 'unsafe-eval' removed in production — it completely negates XSS protections
  // 'unsafe-eval' is conditionally kept in development for Next.js Fast Refresh/source-maps compatibility
  // 'unsafe-inline' kept for Next.js inline styles/scripts compatibility
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${unsafeEval} https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com https://*.razorpay.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: http:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://open.er-api.com https://api.gold-api.com https://*.razorpay.com;
    frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com https://*.google.com https://*.google.co.in;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https:;
    frame-ancestors 'none';
    ${isProd ? 'upgrade-insecure-requests;' : ''}
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // CORS: Restrict cross-origin API access
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

// Config to apply proxy to all page/api routes except static assets
export const config = {
  matcher: [
    // Apply to all routes except files in public folder, next internal resources, static directories, etc.
    '/((?!_next/static|_next/image|favicon.ico|images|mock-emails|.*\\.).*)',
  ],
};
