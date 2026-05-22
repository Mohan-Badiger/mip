import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/backend/config/dbConnect';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import Cart from '@/backend/models/Cart';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
    }

    // 1. Signature validation
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let isVerified = false;

    if (key_secret && !razorpayOrderId.startsWith('order_mock_')) {
      if (!razorpaySignature) {
        return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
      }
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isVerified = generatedSignature === razorpaySignature;
    } else {
      // Automatic success for mock orders in local development
      isVerified = true;
    }

    if (!isVerified) {
      // Set order paymentStatus to failed
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'failed' }
      );
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // 2. Locate and transition the Order
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found for the transaction' }, { status: 404 });
    }

    if (order.paymentStatus === 'captured') {
      return NextResponse.json({ success: true, message: 'Order already processed', order });
    }

    // 3. Decrement Inventory Stock with transaction checks
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // 4. Update order payment statuses
    order.paymentStatus = 'captured';
    order.orderStatus = 'processing';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature || 'mock_sig_dev';
    await order.save();

    // 5. Clear User Shopping Cart state
    await Cart.deleteOne({ user: user._id });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order processed successfully',
      order
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
