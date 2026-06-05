import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Cart from '@/backend/models/Cart';
import User from '@/backend/models/User';
import Product from '@/backend/models/Product';
import { sendCartAbandonmentEmail } from '@/backend/services/emailService';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();

    // 1. Verify cron secret (MANDATORY — endpoint is locked without it)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret') || req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden: Invalid or missing cron secret' }, { status: 403 });
    }

    // Ensure models are registered in Mongoose
    User.name;
    Product.name;

    // 2. Define abandonment window: updated between 6 hours and 24 hours ago
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find carts that meet abandonment criteria
    const abandonedCarts = await Cart.find({
      updatedAt: { $gte: twentyFourHoursAgo, $lte: sixHoursAgo },
      abandonedEmailSent: { $ne: true },
      items: { $exists: true, $not: { $size: 0 } }
    })
    .populate('user', 'name email phone')
    .populate('items.product');

    let processedCount = 0;
    let skippedCount = 0;
    const details = [];

    // 3. Process each abandoned cart
    for (const cart of abandonedCarts) {
      if (!cart.user || !cart.user.email) {
        skippedCount++;
        continue;
      }

      try {
        await sendCartAbandonmentEmail(cart.user.email, cart, cart.user);
        
        // Mark as sent to prevent duplicate reminders
        cart.abandonedEmailSent = true;
        await cart.save();
        
        processedCount++;
        details.push({
          cartId: cart._id.toString(),
          email: cart.user.email,
          itemsCount: cart.items.length
        });
      } catch (err) {
        console.error(`[CRON CART] Error processing cart #${cart._id}:`, err.message);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalFound: abandonedCarts.length,
        processed: processedCount,
        skipped: skippedCount
      },
      details
    });

  } catch (error) {
    console.error('[CRON CART ERROR] Failed to run cart abandonment job:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  return GET(req);
}
