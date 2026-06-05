import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import { rateLimit } from '@/backend/lib/rateLimit';

// Input validation schema to prevent NoSQL injection
const checkEmailSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();

    // Rate limit to prevent email enumeration attacks
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const limitIp = rateLimit(`check-email:ip:${ip}`, 10, 600000); // 10 requests per 10 min
    if (!limitIp.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const result = checkEmailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email } = result.data;
    const user = await User.findOne({ email: email.toLowerCase() }).select('_id').lean();
    return NextResponse.json({ success: true, exists: !!user });
  } catch (error) {
    console.error('Error in check-email API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
