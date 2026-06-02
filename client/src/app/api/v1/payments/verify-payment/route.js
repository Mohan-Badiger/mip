import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dbConnect from '@/backend/config/dbConnect';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import Cart from '@/backend/models/Cart';
import { authenticate } from '@/backend/middlewares/authMiddleware';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/backend/config/env';

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

    // 1. Locate the Order
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found for the transaction' }, { status: 404 });
    }

    if (order.paymentStatus === 'captured') {
      return NextResponse.json({ success: true, message: 'Order already processed', order });
    }

    const isCod = order.paymentMethod === 'cod';
    let isVerified = false;

    if (isCod) {
      // COD orders bypass Razorpay signature validation
      isVerified = true;
    } else {
      // 2. Online Payment Signature Validation
      const key_secret = RAZORPAY_KEY_SECRET;
      const key_id = RAZORPAY_KEY_ID;

      const isTestMode = !key_id || key_id.startsWith('rzp_test_');

      if (key_secret) {
        if (isTestMode && (razorpaySignature === 'mock_sig_dev' || razorpayPaymentId.startsWith('pay_mock_') || razorpayOrderId.startsWith('order_mock_'))) {
          // Allow mock signatures in test/development mode
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
        order.paymentStatus = 'failed';
        await order.save();
        return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
      }

      // 3. Failsafe Gateway Verification (fetch payment details from Razorpay)
      if (key_id && key_secret && !razorpayPaymentId.startsWith('pay_mock_') && !razorpayOrderId.startsWith('order_mock_')) {
        try {
          const razorpay = new Razorpay({ key_id, key_secret });
          const payment = await razorpay.payments.fetch(razorpayPaymentId);
          if (!payment) {
            return NextResponse.json({ error: 'Payment details not found on gateway' }, { status: 400 });
          }

          // Verify amount in paise matches order grandTotal * 100
          const expectedAmount = order.grandTotal * 100;
          if (payment.amount !== expectedAmount) {
            return NextResponse.json({
              error: `Payment amount mismatch. Expected: ${expectedAmount} paise, Received: ${payment.amount} paise`
            }, { status: 400 });
          }

          // Verify payment order ID matches
          if (payment.order_id !== order.razorpayOrderId) {
            return NextResponse.json({
              error: `Payment order ID mismatch. Expected: ${order.razorpayOrderId}, Received: ${payment.order_id}`
            }, { status: 400 });
          }

          // Verify payment status is authorized or captured
          if (payment.status !== 'authorized' && payment.status !== 'captured') {
            return NextResponse.json({
              error: `Payment status is invalid: ${payment.status}. Payment must be authorized or captured.`
            }, { status: 400 });
          }
        } catch (err) {
          return NextResponse.json({ error: `Failed to fetch payment details from Razorpay: ${err.message}` }, { status: 502 });
        }
      }
    }

    // 4. Decrement Inventory Stock atomically with rollbacks if stock is unavailable
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
      // Set orderStatus to 'cancelled' and paymentStatus to 'captured' (or 'pending' for COD).
      order.paymentStatus = isCod ? 'pending' : 'captured';
      order.orderStatus = 'cancelled';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature || 'mock_sig_dev';
      await order.save();
      
      return NextResponse.json({
        success: false,
        error: `Order checkout could not be completed because the items went out of stock: ${err.message}. Customer support will contact you.`,
        order
      }, { status: 409 });
    }

    // 5. Update order payment and fulfillment statuses on success
    order.paymentStatus = isCod ? 'pending' : 'captured';
    order.orderStatus = 'processing';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature || 'mock_sig_dev';
    await order.save();

    // 6. Clear User Shopping Cart state
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
