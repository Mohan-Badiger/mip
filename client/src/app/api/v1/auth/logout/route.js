import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    const isProd = process.env.NODE_ENV === 'production';
    response.headers.set(
      'Set-Cookie',
      `accessToken=; Path=/; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
