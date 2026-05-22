import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

// In-memory rate limiter: max 5 OTP verification attempts per email per hour
const rateLimitMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email) {
  const now = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(email, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function resetRateLimit(email) {
  rateLimitMap.delete(email);
}

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, type } = await req.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'Email, verification code, and type are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpTrimmed = otp.trim();

    // Rate limiting: max 5 failed attempts per email per hour
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please request a new passcode after 1 hour.' },
        { status: 429 }
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
    resetRateLimit(normalizedEmail);

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
