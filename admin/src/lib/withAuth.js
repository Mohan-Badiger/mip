import { NextResponse } from 'next/server';
import { authenticateAdmin, authorizeAdminRoles } from './authMiddleware';

/**
 * Higher-order wrapper that adds authentication + optional role-based
 * authorization to an API route handler.
 *
 * Usage (inside route.js):
 *   import { withAuth } from '@/lib/withAuth';
 *
 *   async function handler(req, { user, params }) { ... }
 *
 *   export const GET  = withAuth(handler);                       // any admin role
 *   export const PUT  = withAuth(handler, ['admin']);             // admin only
 *   export const DELETE = withAuth(handler, ['admin']);           // admin only
 */
export function withAuth(handler, requiredRoles) {
  return async function protectedHandler(req, ctx) {
    try {
      const user = await authenticateAdmin(req);

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in.' },
          { status: 401 }
        );
      }

      if (requiredRoles && requiredRoles.length > 0) {
        if (!authorizeAdminRoles(user, ...requiredRoles)) {
          return NextResponse.json(
            { error: 'You do not have permission to perform this action.' },
            { status: 403 }
          );
        }
      }

      // Inject user into context so handlers can access it
      const augmentedCtx = { ...ctx, user };
      return handler(req, augmentedCtx);
    } catch (error) {
      console.error('[withAuth] Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
