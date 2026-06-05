import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import { withAuth } from '@/lib/withAuth';

let cachedDashboardData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute in-memory cache

export const GET = withAuth(async function GET() {
  try {
    await dbConnect();

    // Check cache first
    const now = Date.now();
    if (cachedDashboardData && (now - cacheTimestamp < CACHE_DURATION)) {
      return NextResponse.json({
        success: true,
        data: cachedDashboardData
      });
    }

    // Register schemas
    User.name;
    Product.name;
    Category.name;

    // 1. Total Revenue (paymentStatus = captured or authorized)
    const revenueAggregate = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['captured', 'authorized'] } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

    // 2. Pending Orders (orderStatus in received, processing, shipped)
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['received', 'processing', 'shipped'] }
    });

    // 3. Total Customers (role = customer)
    const customerCount = await User.countDocuments({ role: 'customer' });

    // 4. Active Products
    const activeProductsCount = await Product.countDocuments({ isActive: true });

    // 5. Recent 5 Orders
    const recentOrdersDb = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = recentOrdersDb.map(o => ({
      id: o.razorpayOrderId || o._id.toString().slice(-8).toUpperCase(),
      dbId: o._id,
      customer: o.user?.name || 'Guest Customer',
      items: o.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
      time: formatTimeAgo(o.createdAt),
      amount: `₹${o.grandTotal.toLocaleString('en-IN')}`,
      status: o.orderStatus
    }));

    // 6. Top Categories Chart Data (optimized with Mongo $lookup to avoid N+1 DB requests)
    const topCategoriesDb = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          name: { $ifNull: [{ $arrayElemAt: ['$categoryInfo.name', 0] }, 'Uncategorized'] },
          products: '$count'
        }
      }
    ]);

    const topCategories = topCategoriesDb.length > 0 ? topCategoriesDb : [
      { name: "Bridal Necklaces", products: 0 },
      { name: "Diamond Rings", products: 0 },
      { name: "Gold Bangles", products: 0 },
      { name: "Temple Jewellery", products: 0 },
      { name: "Office Wear", products: 0 }
    ];

    // 7. Revenue Overview Chart Data (last 6 months)
    const salesByMonth = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['captured', 'authorized'] } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: '$grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let revenueData = salesByMonth.map(s => ({
      name: `${monthNames[s._id.month - 1]}`,
      total: s.total
    }));

    // Fallback if no sales data: Return empty array instead of fake revenue numbers (BUG-05)
    if (revenueData.length === 0) {
      revenueData = [];
    }

    // 8. Conversion Data (Mock premium rate curve)
    const conversionData = [
      { name: "Mon", rate: 2.4 },
      { name: "Tue", rate: 2.1 },
      { name: "Wed", rate: 2.6 },
      { name: "Thu", rate: 2.8 },
      { name: "Fri", rate: 3.2 },
      { name: "Sat", rate: 3.8 },
      { name: "Sun", rate: 4.1 }
    ];

    const dashboardData = {
      stats: {
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        pendingOrders: pendingOrdersCount,
        visitors: customerCount,
        activeProducts: activeProductsCount
      },
      revenueData,
      conversionData,
      recentOrders,
      topCategories
    };

    // Save to cache
    cachedDashboardData = dashboardData;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error loading dashboard statistics:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while loading dashboard statistics.' }, { status: 500 });
  }
});

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
