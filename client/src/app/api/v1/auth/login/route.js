import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import { rateLimit } from '@/backend/lib/rateLimit';
import { JWT_SECRET } from '@/backend/config/env';

// Input validation schema to prevent NoSQL query injection and malformed payloads
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'JWT_SECRET is not configured on the server.' }, { status: 500 });
    }

    
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Parse and validate raw JSON body
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Rate Limiting: Max 5 login attempts per email/IP per minute
    const limitEmail = rateLimit(`login:email:${normalizedEmail}`, 5, 60000);
    const limitIp = rateLimit(`login:ip:${ip}`, 5, 60000);

    if (!limitEmail.success || !limitIp.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user account is suspended
    if (user.status === 'Suspended') {
      return NextResponse.json({ error: 'Account has been suspended. Please contact support.' }, { status: 403 });
    }

    // Check if user is temporarily locked out
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - new Date()) / 60000);
      return NextResponse.json({
        error: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`
      }, { status: 423 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let errorMessage = 'Invalid email or password';
      let status = 401;

      if (user.failedLoginAttempts >= 20) {
        user.status = 'Suspended';
        errorMessage = 'Account has been suspended due to too many failed login attempts. Please contact support.';
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
      return NextResponse.json({ error: errorMessage }, { status });
    }

    // Reset lockout counters on successful login
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
      await user.save();
    }

    // Create JWT Token
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
        addresses: user.addresses
      }
    });

    // Set secure cookie
    const isProd = process.env.NODE_ENV === 'production';
    response.headers.set('Set-Cookie', `accessToken=${token}; Path=/; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Lax; Max-Age=604800`);

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
  }
}

