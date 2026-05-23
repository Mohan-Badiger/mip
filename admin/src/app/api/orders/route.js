import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';
import { logAdminAction } from '@/lib/auditLogger';
import { sendOrderStatusEmail } from '@/lib/notificationHelper';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Ensure User and Product schemas are registered
    User.name;
    Product.name;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let filter = {};

    if (search) {
      // Find matching users first
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      filter.$or = [
        { user: { $in: userIds } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } }
      ];

      // If it looks like a valid Mongo ID, add that as well
      if (mongoose.isValidObjectId(search)) {
        filter.$or.push({ _id: search });
      }
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images sku')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orderId, orderStatus, trackingId, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID (orderId) is required' }, { status: 400 });
    }

    const originalOrder = await Order.findById(orderId).populate('user', 'name email phone');
    if (!originalOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updates = {};
    if (orderStatus !== undefined) updates.orderStatus = orderStatus;
    if (trackingId !== undefined) updates.trackingId = trackingId;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;

    // Restore inventory if status transitions to cancelled
    if (updates.orderStatus === 'cancelled' && originalOrder.orderStatus !== 'cancelled') {
      for (const item of originalOrder.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Order',
      entityId: orderId,
      description: `Updated order properties: status ${originalOrder.orderStatus} -> ${updatedOrder.orderStatus}, tracking ${originalOrder.trackingId || 'None'} -> ${updatedOrder.trackingId || 'None'}, payment ${originalOrder.paymentStatus} -> ${updatedOrder.paymentStatus}`,
      changes: {
        original: originalOrder.toObject(),
        updated: updatedOrder.toObject()
      }
    });

    // Send email notification if status is shipped/delivered, or if tracking changed while shipped/delivered
    const statusChanged = originalOrder.orderStatus !== updatedOrder.orderStatus;
    const trackingChanged = originalOrder.trackingId !== updatedOrder.trackingId;
    const isNotifyStatus = updatedOrder.orderStatus === 'shipped' || updatedOrder.orderStatus === 'delivered';

    if (isNotifyStatus && (statusChanged || trackingChanged)) {
      await sendOrderStatusEmail(updatedOrder, updatedOrder.orderStatus, updatedOrder.trackingId);
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
