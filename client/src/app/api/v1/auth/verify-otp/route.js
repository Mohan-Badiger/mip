import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';
import { rateLimit, resetRateLimit } from '@/backend/lib/rateLimit';
import { JWT_SECRET } from '@/backend/config/env';

// Input validation schema to prevent NoSQL query injection and ensure type-safety
const verifyOtpSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  otp: z.string().trim().regex(/^[0-9]{6}$/, { message: 'Verification code must be exactly 6 digits' }),
  type: z.enum(['register', 'login', 'reset'], { message: 'Invalid verification type' }),
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
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, otp, type } = result.data;
    const normalizedEmail = email.toLowerCase();
    const otpTrimmed = otp.trim();

    // Rate Limiting: Max 5 failed attempts per email per hour
    const limitEmail = rateLimit(`otp-verify:email:${normalizedEmail}`, 5, 3600000);
    // Rate Limiting: Max 10 verification attempts per IP per 10 minutes (to prevent brute forcing)
    const limitIp = rateLimit(`otp-verify:ip:${ip}`, 10, 600000);

    if (!limitEmail.success || !limitIp.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((Math.min(limitEmail.reset, limitIp.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }


    // Find the OTP document in the database that is not expired
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: otpTrimmed,
      type,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired verification passcode' }, { status: 400 });
    }

    // Reset rate limit on successful match
    resetRateLimit(`otp-verify:email:${normalizedEmail}`);

    let user = null;

    if (type === 'register') {
      if (!otpRecord.payload || !otpRecord.payload.name || !otpRecord.payload.phone || !otpRecord.payload.password) {
        return NextResponse.json({ error: 'Invalid registration payload session' }, { status: 400 });
      }

      // Finalize user registration in DB
      user = new User({
        name: otpRecord.payload.name,
        email: normalizedEmail,
        phone: otpRecord.payload.phone,
        password: otpRecord.payload.password, // Pre-hashed password
        addresses: []
      });

      await user.save();

      // Clean up the verified registration OTP
      await Otp.deleteOne({ _id: otpRecord._id });

    } else if (type === 'login') {
      // Find the user to log in
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 });
      }

      // Clean up the verified login OTP
      await Otp.deleteOne({ _id: otpRecord._id });

    } else if (type === 'reset') {
      // For password reset, mark the OTP document as verified
      // and extend its lifetime to 5 minutes so they can complete the reset
      otpRecord.verified = true;
      otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await otpRecord.save();

      return NextResponse.json({
        success: true,
        tempToken: otpRecord._id,
        message: 'Passcode verified successfully. Please enter your new password.'
      });
    } else {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    // Generate JWT Token for login or register success
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
    console.error('Error in verify-otp API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
