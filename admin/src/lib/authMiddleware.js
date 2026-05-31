import jwt from 'jsonwebtoken';
import dbConnect from './dbConnect';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

export async function authenticateAdmin(req) {
  try {
    await dbConnect();
    
    // 1. Read authorization header
    const authHeader = req.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // 2. Fallback to cookies
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/adminAccessToken=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return null;
    }

    // 3. Decode & Verify
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return null;
    }

    // 4. Retrieve user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return null;
    }

    // 5. Ensure user is active and has an admin role
    if (user.status === 'Suspended') {
      return null;
    }

    const allowedRoles = ['admin', 'sales-rep', 'catalog-manager', 'cms-editor'];
    if (!allowedRoles.includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

export function authorizeAdminRoles(user, ...roles) {
  if (!user || !roles.includes(user.role)) {
    return false;
  }
  return true;
}
