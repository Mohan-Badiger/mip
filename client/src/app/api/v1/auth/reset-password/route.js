import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import Otp from '@/backend/models/Otp';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Email, token, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

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
