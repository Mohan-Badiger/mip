import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    return NextResponse.json({ success: true, exists: !!user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
