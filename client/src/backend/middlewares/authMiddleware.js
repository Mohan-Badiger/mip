import jwt from 'jsonwebtoken';
import User from '../models/User';
import dbConnect from '../config/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticate(req) {
  try {
    await dbConnect();
    if (!JWT_SECRET) {
      console.error('[AUTH ERROR] JWT_SECRET environment variable is not defined.');
      return null;
    }

    
    // 1. Read authorization header
    const authHeader = req.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // 2. Fallback to cookies
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/accessToken=([^;]+)/);
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

    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch {
    return null;
  }
}

export function authorizeRoles(...roles) {
  return (user) => {
    if (!user || !roles.includes(user.role)) {
      return false;
    }
    return true;
  };
}
