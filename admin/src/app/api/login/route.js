import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { rateLimit } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET;

// Input validation schema to prevent NoSQL query injection and malformed payloads
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();
    if (!JWT_SECRET) {
      console.error('[AUTH ERROR] JWT_SECRET environment variable is not defined.');
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }

    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Parse and validate raw JSON body
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Rate Limiting: Max 5 login attempts per email/IP per minute
    const limitEmail = rateLimit(`admin-login:email:${normalizedEmail}`, 5, 60000);
    const limitIp = rateLimit(`admin-login:ip:${ip}`, 10, 60000);

    if (!limitEmail.success || !limitIp.success) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((Math.min(limitEmail.reset, limitIp.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Check status
    if (user.status === 'Suspended') {
      return NextResponse.json({ success: false, error: 'Account has been suspended' }, { status: 403 });
    }

    // Verify role
    const allowedRoles = ['admin', 'sales-rep', 'catalog-manager', 'cms-editor'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized role scope' }, { status: 403 });
    }

    // Check if user is temporarily locked out
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - new Date()) / 60000);
      return NextResponse.json({
        success: false,
        error: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`
      }, { status: 423 });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let errorMessage = 'Invalid email or password';
      let status = 401;

      if (user.failedLoginAttempts >= 20) {
        user.status = 'Suspended';
        errorMessage = 'Account has been suspended due to too many failed login attempts.';
        status = 403;
      } else if (user.failedLoginAttempts >= 10) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        errorMessage = 'Too many failed login attempts. Account locked for 30 minutes.';
        status = 423;
      } else if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        errorMessage = 'Too many failed login attempts. Account locked for 5 minutes.';
        status = 423;
      }

      await user.save();
      return NextResponse.json({ success: false, error: errorMessage }, { status });
    }

    // Reset lockout counters on successful login
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      await user.save();
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });

    response.headers.set('Set-Cookie', `adminAccessToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
