import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';
import { rateLimit } from '@/backend/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET;

// Input validation schema to prevent NoSQL query injection and ensure type-safety
const resetPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  token: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid security session token' }),
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
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, token, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Rate Limiting: Max 3 attempts per email or IP per hour
    const limitEmail = rateLimit(`password-reset:email:${normalizedEmail}`, 3, 3600000);
    const limitIp = rateLimit(`password-reset:ip:${ip}`, 3, 3600000);

    if (!limitEmail.success || !limitIp.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again after 1 hour.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((Math.min(limitEmail.reset, limitIp.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Verify token matches the OTP verification record in DB
    const otpRecord = await Otp.findOne({
      _id: token,
      email: normalizedEmail,
      type: 'reset',
      verified: true,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json({
        error: 'Security session expired or invalid request. Please request a new passcode.'
      }, { status: 400 });
    }


    // Encrypt/hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find user and update their password
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Clean up the verified reset OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Automatically log the user in after password reset
    const jwtToken = jwt.sign(
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
      },
      message: 'Your password has been successfully reset.'
    });

    // Set secure cookie
    response.headers.set('Set-Cookie', `accessToken=${jwtToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);

    return response;
  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
