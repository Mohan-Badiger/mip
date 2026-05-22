import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';
import { sendOtpEmail } from '@/backend/services/emailService';

// Rate limiter: max 3 OTP sends per email per 15 minutes
const sendRateLimitMap = new Map();
const MAX_SENDS = 3;
const SEND_WINDOW_MS = 15 * 60 * 1000;

function checkSendRateLimit(email) {
  const now = Date.now();
  const entry = sendRateLimitMap.get(email);
  if (!entry || now - entry.windowStart > SEND_WINDOW_MS) {
    sendRateLimitMap.set(email, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_SENDS) return false;
  entry.count += 1;
  return true;
}

export async function POST(req) {
  try {
    await dbConnect();
    const { email, type, payload } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and verification type are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting: max 3 OTP sends per email per 15 minutes
    if (!checkSendRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 15 minutes before requesting another passcode.' },
        { status: 429 }
      );
    }

    // Verify context based on type
    if (type === 'register') {
      if (!payload || !payload.name || !payload.phone || !payload.password) {
        return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
      }

      if (payload.password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { phone: payload.phone }
        ]
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email or phone number is already registered' }, { status: 400 });
      }
    } else if (type === 'login' || type === 'reset') {
      // Check if user exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Process payload (hash password for register)
    let processedPayload = null;
    if (type === 'register') {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      processedPayload = {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        password: hashedPassword
      };
    }

    // Remove any existing OTP records for this email and type
    await Otp.deleteMany({ email: normalizedEmail, type });

    // Save new OTP record
    const otpDoc = new Otp({
      email: normalizedEmail,
      otp: otpCode,
      type,
      payload: processedPayload,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    await otpDoc.save();

    // Send the OTP via email service
    await sendOtpEmail(normalizedEmail, otpCode, type);

    return NextResponse.json({
      success: true,
      message: 'Verification passcode has been sent to your email.'
    });
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
