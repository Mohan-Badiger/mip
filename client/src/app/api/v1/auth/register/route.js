import { NextResponse } from 'next/server';

export async function POST(req) {
  return NextResponse.json(
    { error: 'Direct registration is deprecated. Please use the secure OTP verification flow instead.' },
    { status: 410 }
  );
}

