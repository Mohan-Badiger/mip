import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import GoldRate from '@/backend/models/GoldRate';

// Seeding defaults
// Seeding defaults (accurate to Bengaluru retail rates)
const DEFAULT_RATES = [
  { metal: 'gold', purity: '18KT', pricePerGram: 11917 },
  { metal: 'gold', purity: '22KT', pricePerGram: 14565 },
  { metal: 'gold', purity: '24KT', pricePerGram: 15889 },
  { metal: 'silver', purity: '950PT', pricePerGram: 109 },
  { metal: 'platinum', purity: '950PT', pricePerGram: 3514 }
];

export async function GET() {
  try {
    await dbConnect();
    let rates = await GoldRate.find({});
    
    // Check if we need to refresh rates from external APIs (cache for 15 minutes)
    const CACHE_DURATION_MS = 15 * 60 * 1000;
    const isCacheValid = rates.length > 0 && 
                         rates.every(r => (Date.now() - new Date(r.updatedAt).getTime()) < CACHE_DURATION_MS) &&
                         !rates.some(r => r.metal === 'gold' && r.purity === '24KT' && r.pricePerGram < 10000); // force refresh if old rates are in DB

    if (!isCacheValid) {
      try {
        // Fetch prices in USD (per troy ounce)
        const [xauRes, xagRes, xptRes, exRes] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU'),
          fetch('https://api.gold-api.com/price/XAG'),
          fetch('https://api.gold-api.com/price/XPT'),
          fetch('https://open.er-api.com/v6/latest/USD')
        ]);

        const [xauData, xagData, xptData, exData] = await Promise.all([
          xauRes.json(),
          xagRes.json(),
          xptRes.json(),
          exRes.json()
        ]);

        const usdToInr = exData?.rates?.INR || 95.33;
        const gramsPerOunce = 31.1034768;

        // Indian gold price includes 6% customs duty, 5% AIDC, 3% GST and local transport/refining premiums (~14.7% total markup)
        const INDIA_PREMIUM_MULTIPLIER = 1.147;

        // XAU is price per troy ounce of 24KT Gold
        const xauUsdPerOunce = xauData?.price;
        if (xauUsdPerOunce) {
          const gold24PricePerGram = Math.round((xauUsdPerOunce / gramsPerOunce) * usdToInr * INDIA_PREMIUM_MULTIPLIER);
          const gold22PricePerGram = Math.round(gold24PricePerGram * (22 / 24));
          const gold18PricePerGram = Math.round(gold24PricePerGram * (18 / 24));

          await GoldRate.findOneAndUpdate(
            { metal: 'gold', purity: '24KT' },
            { pricePerGram: gold24PricePerGram },
            { upsert: true }
          );
          await GoldRate.findOneAndUpdate(
            { metal: 'gold', purity: '22KT' },
            { pricePerGram: gold22PricePerGram },
            { upsert: true }
          );
          await GoldRate.findOneAndUpdate(
            { metal: 'gold', purity: '18KT' },
            { pricePerGram: gold18PricePerGram },
            { upsert: true }
          );
        }

        // XAG is price per troy ounce of Silver
        const xagUsdPerOunce = xagData?.price;
        if (xagUsdPerOunce) {
          const silverPricePerGram = Math.round((xagUsdPerOunce / gramsPerOunce) * usdToInr * INDIA_PREMIUM_MULTIPLIER);
          await GoldRate.findOneAndUpdate(
            { metal: 'silver', purity: '950PT' },
            { pricePerGram: silverPricePerGram },
            { upsert: true }
          );
        }

        // XPT is price per troy ounce of Platinum
        const xptUsdPerOunce = xptData?.price;
        if (xptUsdPerOunce) {
          const platinumPricePerGram = Math.round((xptUsdPerOunce / gramsPerOunce) * usdToInr * INDIA_PREMIUM_MULTIPLIER);
          await GoldRate.findOneAndUpdate(
            { metal: 'platinum', purity: '950PT' },
            { pricePerGram: platinumPricePerGram },
            { upsert: true }
          );
        }

        // Re-query database to return updated rates
        rates = await GoldRate.find({});
      } catch (err) {
        console.error('Failed to fetch online gold rates, using cached DB values:', err);
      }
    }

    if (rates.length === 0) {
      // Seed default rates on first database access if everything failed
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
