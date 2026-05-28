import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Coupon from '@/backend/models/Coupon';
import Order from '@/backend/models/Order';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    
    // Find all active & non-expired coupons
    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() }
    };

    let applicableCoupons = await Coupon.find(query).sort({ createdAt: -1 });

    if (user) {
      const orderCount = await Order.countDocuments({
        user: user._id,
        orderStatus: { $ne: 'cancelled' }
      });

      if (orderCount > 0) {
        // Exclude first-time only coupons for users with existing orders
        applicableCoupons = applicableCoupons.filter(c => !c.firstTimeOnly);
      }
    }

    return NextResponse.json({
      success: true,
      coupons: applicableCoupons
    });

  } catch (error) {
    console.error('Error fetching applicable coupons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
