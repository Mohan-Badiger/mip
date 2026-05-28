import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // Ensure Product model is registered in Mongoose so populate works
    Product.name;

    const dbOrders = await Order.find({ user: user._id })
      .populate('items.product', 'images slug')
      .sort({ createdAt: -1 });

    const formattedOrders = dbOrders.map(order => {
      // Map payment status code
      let methodLabel = 'online';
      if (order.paymentStatus === 'captured' && order.razorpayPaymentId?.startsWith('pay_mock_')) {
        methodLabel = 'cod';
      } else if (order.paymentStatus === 'pending') {
        methodLabel = 'cod'; // assume cod or pending
      }

      // Map db statuses to client-side friendly statuses
      // DB statuses: 'received', 'processing', 'shipped', 'delivered', 'cancelled'
      // Client-side statuses: 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
      let clientStatus = 'Pending';
      if (order.orderStatus === 'processing') {
        clientStatus = 'Processing';
      } else if (order.orderStatus === 'shipped') {
        clientStatus = 'Shipped';
      } else if (order.orderStatus === 'delivered') {
        clientStatus = 'Delivered';
      } else if (order.orderStatus === 'cancelled') {
        clientStatus = 'Cancelled';
      }

      return {
        id: order._id.toString(),
        razorpayOrderId: order.razorpayOrderId,
        date: new Date(order.createdAt).toISOString().split('T')[0],
        paymentMethod: methodLabel,
        paymentStatus: order.paymentStatus,
        status: clientStatus,
        orderStatus: order.orderStatus,
        trackingId: order.trackingId || '',
        subtotal: order.subTotal,
        tax: order.taxAmount,
        total: order.grandTotal,
        items: order.items.map(item => ({
          id: item.product?._id?.toString() || item._id?.toString() || 'deleted',
          name: item.name,
          price: item.finalPriceLocked / (item.quantity || 1),
          quantity: item.quantity,
          weight: `${item.metalWeightLocked}g`,
          metal: `${item.metalPurityLocked}`,
          image: item.product?.images?.[0] || item.image || '/placeholder.jpg',
          slug: item.product?.slug || item.slug || ''
        }))
      };
    });

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching client orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
