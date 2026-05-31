import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear cookie by setting expiration in the past
    response.headers.set('Set-Cookie', 'adminAccessToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
    
    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
