import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';
import { sendOtpEmail } from '@/backend/services/emailService';
import { rateLimit } from '@/backend/lib/rateLimit';

const OTP_HASH_ROUNDS = 6; // Lower rounds OK for short-lived OTPs

// Input validation schema to prevent NoSQL query injection and enforce type checks
const sendOtpSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
  type: z.enum(['register', 'login', 'reset'], { message: 'Invalid verification type' }),
  payload: z.object({
    name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(50).optional(),
    phone: z.string().trim().regex(/^[0-9]{10}$/, { message: 'Phone number must be a valid 10-digit number' }).optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100).optional(),
  }).optional(),
});

export async function POST(req) {
  try {
    await dbConnect();
    
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Parse and validate raw JSON body
    const body = await req.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, type, payload } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Rate Limiting: Max 3 OTP sends per email per 15 minutes
    const limitEmail = rateLimit(`otp-send:email:${normalizedEmail}`, 3, 900000);
    // Rate Limiting: Max 5 OTP sends per IP per 10 minutes (to prevent brute forcing many emails)
    const limitIp = rateLimit(`otp-send:ip:${ip}`, 5, 600000);

    if (!limitEmail.success || !limitIp.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before requesting another passcode.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((Math.min(limitEmail.reset, limitIp.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Verify context based on type
    if (type === 'register') {
      if (!payload || !payload.name || !payload.phone || !payload.password) {
        return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
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
    }


    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing (prevents plaintext exposure if DB is compromised)
    const hashedOtp = await bcrypt.hash(otpCode, OTP_HASH_ROUNDS);

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

    // Save new OTP record with hashed OTP
    const otpDoc = new Otp({
      email: normalizedEmail,
      otp: hashedOtp,
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
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
