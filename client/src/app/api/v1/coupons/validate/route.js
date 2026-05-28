import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Coupon from '@/backend/models/Coupon';
import Order from '@/backend/models/Order';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Please log in to apply promo codes.' }, { status: 401 });
    }

    const { code, cartTotal } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }
    if (cartTotal === undefined || isNaN(cartTotal)) {
      return NextResponse.json({ error: 'Cart total is required.' }, { status: 400 });
    }

    const promoCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: promoCode, isActive: true });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'This coupon code has expired.' }, { status: 400 });
    }

    // Check min value
    if (cartTotal < coupon.minCartValue) {
      return NextResponse.json({ error: `This coupon is only applicable on orders above ₹${coupon.minCartValue.toLocaleString('en-IN')}` }, { status: 400 });
    }

    // Check first time user constraint
    if (coupon.firstTimeOnly) {
      // Find orders matching this user where orderStatus is not cancelled
      const orderCount = await Order.countDocuments({
        user: user._id,
        orderStatus: { $ne: 'cancelled' }
      });

      if (orderCount > 0) {
        return NextResponse.json({ error: 'This promo code is only valid for your first-time purchase.' }, { status: 400 });
      }
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(cartTotal * (coupon.discountValue / 100));
    } else if (coupon.discountType === 'flat') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'free-making') {
      // Free making charge is handled as a flat discount based on user selection or we can just apply a flat rate if stored,
      // here we treat the discountValue itself as the making charges discount or default to a flat discount value.
      discount = coupon.discountValue || 1000;
    }

    // Cap discount at cartTotal
    discount = Math.min(discount, cartTotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minCartValue: coupon.minCartValue,
        description: coupon.description,
        firstTimeOnly: coupon.firstTimeOnly,
        discount
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
