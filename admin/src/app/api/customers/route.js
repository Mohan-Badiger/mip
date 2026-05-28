import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let filter = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(filter).sort({ createdAt: -1 });

    // Aggregate order count and total spent for all customers to avoid N+1 queries
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $in: ['$paymentStatus', ['captured', 'authorized']] },
                '$grandTotal',
                0
              ]
            }
          }
        }
      }
    ]);

    const statsMap = {};
    orderStats.forEach(stat => {
      if (stat._id) {
        statsMap[stat._id.toString()] = {
          orderCount: stat.orderCount,
          totalSpent: stat.totalSpent
        };
      }
    });

    const result = customers.map(customer => {
      const stats = statsMap[customer._id.toString()] || { orderCount: 0, totalSpent: 0 };
      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        orders: stats.orderCount,
        spent: stats.totalSpent,
        status: stats.orderCount >= 5 ? 'VIP' : stats.orderCount > 0 ? 'Active' : 'Inactive'
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
