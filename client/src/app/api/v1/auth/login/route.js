import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import { rateLimit } from '@/backend/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

// Input validation schema to prevent NoSQL query injection and malformed payloads
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();
    
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
    response.headers.set('Set-Cookie', `accessToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

