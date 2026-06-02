import { NextResponse } from 'next/server';

export function proxy(request) {
  const response = NextResponse.next();
  const isProd = process.env.NODE_ENV === 'production';

  // Enforce HTTPS and HSTS (Strict-Transport-Security) for 2 years (only in production)
  if (isProd) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  // Protect against clickjacking (X-Frame-Options)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Protect against MIME type sniffing (X-Content-Type-Options)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy setting: Send full URL for same-origin, only origin for cross-origin, nothing for insecure
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Control browser feature permissions
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=*');

  // Control DNS prefetching to avoid leakages
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Content Security Policy (CSP) Definition
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://checkout.razorpay.com https://*.razorpay.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https: http:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://open.er-api.com https://api.gold-api.com https://*.razorpay.com;
    frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https:;
    frame-ancestors 'none';
    ${isProd ? 'upgrade-insecure-requests;' : ''}
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Config to apply proxy to all page/api routes except static assets
export const config = {
  matcher: [
    // Apply to all routes except files in public folder, next internal resources, static directories, etc.
    '/((?!_next/static|_next/image|favicon.ico|images|mock-emails|.*\\.).*)',
  ],
};
