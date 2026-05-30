import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Settings from '@/backend/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      // Seed default settings on first database access if not present
      settings = await Settings.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings in client:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
