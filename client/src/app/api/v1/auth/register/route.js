import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import { rateLimit } from '@/backend/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

// Input validation schema to prevent NoSQL query injection and enforce type-safety
const registerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(50),
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  phone: z.string().trim().regex(/^[0-9]{10}$/, { message: 'Phone number must be a valid 10-digit number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();

    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting: Max 3 registration attempts per IP per 5 minutes
    const limitIp = rateLimit(`register:ip:${ip}`, 3, 300000);
    if (!limitIp.success) {
      return NextResponse.json(
        { error: 'Too many registrations from this connection. Please try again in a few minutes.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limitIp.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Parse and validate raw JSON body
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, phone, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or phone number is already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      addresses: []
    });

    await user.save();

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

