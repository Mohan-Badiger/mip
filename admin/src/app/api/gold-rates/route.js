import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GoldRate from '@/lib/models/GoldRate';
import { logAdminAction } from '@/lib/auditLogger';
import { triggerClientRevalidate } from '@/lib/revalidateHelper';
import { withAuth } from '@/lib/withAuth';

const DEFAULT_RATES = [
  { metal: 'gold', purity: '18KT', pricePerGram: 6000 },
  { metal: 'gold', purity: '22KT', pricePerGram: 7200 },
  { metal: 'gold', purity: '24KT', pricePerGram: 7850 },
  { metal: 'silver', purity: '950PT', pricePerGram: 95 },
  { metal: 'platinum', purity: '950PT', pricePerGram: 3200 }
];

export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    let rates = await GoldRate.find({});
    
    if (rates.length === 0) {
      await GoldRate.insertMany(DEFAULT_RATES);
      rates = await GoldRate.find({});
    }
    
    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error('Error fetching gold rates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { rates } = body; // Expects array of { metal, purity, pricePerGram }

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json({ success: false, error: 'Rates array is required' }, { status: 400 });
    }

    const originalRates = await GoldRate.find({});

    const promises = rates.map(async (r) => {
      const { metal, purity, pricePerGram } = r;
      if (!metal || !purity || pricePerGram === undefined) return;
      return GoldRate.findOneAndUpdate(
        { metal, purity },
        { pricePerGram: Number(pricePerGram) },
        { upsert: true, new: true }
      );
    });

    await Promise.all(promises);

    const updatedRates = await GoldRate.find({});

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'GoldRate',
      entityId: 'all-rates',
      description: `Updated gold and precious metal rates`,
      changes: {
        original: originalRates.map(r => r.toObject()),
        updated: updatedRates.map(r => r.toObject())
      }
    });

    // Trigger cache revalidation on the client
    await triggerClientRevalidate('gold-rates');

    return NextResponse.json({ success: true, data: updatedRates });
  } catch (error) {
    console.error('Error updating gold rates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
