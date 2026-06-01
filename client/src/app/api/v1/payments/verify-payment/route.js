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
    const key_id = process.env.RAZORPAY_KEY_ID;
    let isVerified = false;

    const isTestMode = !key_id || key_id.startsWith('rzp_test_');

    if (key_secret) {
      if (isTestMode && (razorpaySignature === 'mock_sig_dev' || razorpayPaymentId.startsWith('pay_mock_') || razorpayOrderId.startsWith('order_mock_'))) {
        // Allow mock signatures in test/development mode (e.g. for COD or bypass test transitions)
        isVerified = true;
      } else {
        if (!razorpaySignature) {
          return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
        }
        const generatedSignature = crypto
          .createHmac('sha256', key_secret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        isVerified = generatedSignature === razorpaySignature;
      }
    } else if (razorpayOrderId.startsWith('order_mock_')) {
      isVerified = true;
    } else {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
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

    // 3. Decrement Inventory Stock atomically with rollbacks if stock is unavailable
    let stockError = null;
    const decrementedProducts = [];
    
    try {
      for (const item of order.items) {
        // Attempt to atomically decrement stock only if there is enough stock
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          stockError = `Product "${item.name}" is out of stock or has insufficient quantity`;
          break;
        }
        
        decrementedProducts.push({ productId: item.product, quantity: item.quantity });
      }
      
      if (stockError) {
        // Rollback any stock decrements we already did for this order
        for (const rolledBack of decrementedProducts) {
          await Product.updateOne(
            { _id: rolledBack.productId },
            { $inc: { stock: rolledBack.quantity } }
          );
        }
        throw new Error(stockError);
      }
    } catch (err) {
      // Payment was verified/taken, but items are out of stock.
      // Set orderStatus to 'cancelled' and paymentStatus to 'captured'.
      order.paymentStatus = 'captured';
      order.orderStatus = 'cancelled';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature || 'mock_sig_dev';
      await order.save();
      
      return NextResponse.json({
        success: false,
        error: `Payment was successful, but the items went out of stock during checkout: ${err.message}. Customer support will contact you for a refund.`,
        order
      }, { status: 409 });
    }

    // 4. Update order payment statuses on success
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
