import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Coupon from '@/lib/models/Coupon';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET(req) {
  try {
    await dbConnect();
    
    // Ensure all schemas are registered in Mongoose so populate operations function correctly
    Product.name;
    Order.name;
    User.name;
    Coupon.name;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: { products: [], orders: [], customers: [], coupons: [] }
      });
    }

    const queryStr = q.trim();
    const regex = { $regex: queryStr, $options: 'i' };

    // 1. Search Products (limit 5)
    const products = await Product.find({
      $or: [
        { name: regex },
        { sku: regex },
        { tag: regex }
      ]
    })
      .limit(5)
      .select('name sku price stock isActive images slug metalPurity metalType');

    // 2. Search Orders (limit 5)
    // Find matching users first by customer details
    const users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).select('_id');
    const userIds = users.map(u => u._id);

    const orders = await Order.find({
      $or: [
        { razorpayOrderId: regex },
        { trackingId: regex },
        { user: { $in: userIds } }
      ]
    })
      .populate('user', 'name email phone')
      .limit(5)
      .sort({ createdAt: -1 });

    // 3. Search Customers (limit 5)
    const customers = await User.find({
      role: 'customer',
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    })
      .limit(5)
      .select('name email phone status');

    // 4. Search Coupons (limit 5)
    const coupons = await Coupon.find({
      $or: [
        { code: regex },
        { description: regex }
      ]
    })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        products,
        orders,
        customers,
        coupons
      }
    });
  } catch (error) {
    console.error('Universal search API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
