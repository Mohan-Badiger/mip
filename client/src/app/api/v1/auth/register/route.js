import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_token_key';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, phone, password, pincode } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or phone number is already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      addresses: pincode ? [{
        street: 'Shipping Address Detail',
        city: 'City',
        state: 'State',
        pincode: pincode,
        isDefault: true
      }] : []
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
