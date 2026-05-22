import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import GoldRate from '@/backend/models/GoldRate';

// Seeding defaults
const DEFAULT_RATES = [
  { metal: 'gold', purity: '18KT', pricePerGram: 6000 },
  { metal: 'gold', purity: '22KT', pricePerGram: 7200 },
  { metal: 'gold', purity: '24KT', pricePerGram: 7850 },
  { metal: 'silver', purity: '950PT', pricePerGram: 95 },
  { metal: 'platinum', purity: '950PT', pricePerGram: 3200 }
];

export async function GET() {
  try {
    await dbConnect();
    let rates = await GoldRate.find({});
    
    if (rates.length === 0) {
      // Seed default rates on first database access
      await GoldRate.insertMany(DEFAULT_RATES);
      rates = await GoldRate.find({});
    }

    return NextResponse.json({ success: true, rates });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { metal, purity, pricePerGram } = await req.json();

    if (!metal || !purity || !pricePerGram) {
      return NextResponse.json({ error: 'Missing metal, purity, or price fields' }, { status: 400 });
    }

    // Upsert rate
    const updatedRate = await GoldRate.findOneAndUpdate(
      { metal, purity },
      { pricePerGram },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, rate: updatedRate });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
