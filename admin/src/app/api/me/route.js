import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/authMiddleware';

export async function GET(req) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
