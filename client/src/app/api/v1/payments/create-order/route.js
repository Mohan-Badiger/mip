import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/backend/config/dbConnect';
import Cart from '@/backend/models/Cart';
import Order from '@/backend/models/Order';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress } = await req.json();
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return NextResponse.json({ error: 'Incomplete shipping address provided' }, { status: 400 });
    }

    // 1. Get user's cart
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug' }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Shopping cart is empty' }, { status: 400 });
    }

    // 2. Lock prices & build order items
    let subTotal = 0;
    let taxAmount = 0;
    let grandTotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product ${product?.name || 'Unknown'} is no longer available` }, { status: 400 });
      }

      if (product.stock < cartItem.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
      }

      // Calculate dynamic price lock
      const pricing = await calculateLiveProductPrice(product);

      const itemSubtotal = (pricing.rawMetalValue + pricing.makingCharges + pricing.gemstoneValue) * cartItem.quantity;
      const itemTax = pricing.tax * cartItem.quantity;
      const itemTotal = pricing.finalPrice * cartItem.quantity;

      subTotal += itemSubtotal;
      taxAmount += itemTax;
      grandTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        metalPurityLocked: product.metalPurity,
        metalWeightLocked: product.metalWeight,
        goldRateLocked: pricing.liveRateUsed,
        makingChargesLocked: pricing.makingCharges,
        gemstonesValueLocked: pricing.gemstoneValue,
        finalPriceLocked: pricing.finalPrice,
        image: product.images && product.images[0] ? product.images[0] : '/placeholder.jpg',
        slug: product.slug
      });
    }

    // Round total pricing details
    subTotal = Math.round(subTotal);
    taxAmount = Math.round(taxAmount);
    grandTotal = Math.round(grandTotal);

    // 3. Initialize Order record (generate a placeholder first to get _id)
    const tempRazorpayOrderId = `temp_rp_${Math.random().toString(36).substring(7)}`;
    const order = new Order({
      user: user._id,
      items: orderItems,
      shippingAddress,
      subTotal,
      taxAmount,
      grandTotal,
      razorpayOrderId: tempRazorpayOrderId,
      paymentStatus: 'pending',
      orderStatus: 'received'
    });

    await order.save();

    // 4. Connect to Razorpay
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let finalRazorpayOrderId = '';
    let finalAmount = grandTotal * 100;

    if (key_id && key_secret) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        
        // Cap the amount in test mode to avoid transaction ceiling limits (e.g. ₹1,00,000)
        const isTestKey = key_id.startsWith('rzp_test_');
        if (isTestKey && grandTotal > 50000) {
          finalAmount = 50000 * 100; // Cap to ₹50,000 in test mode so it passes standard limits
        }

        const options = {
          amount: finalAmount, // Razorpay works in paise
          currency: 'INR',
          receipt: order._id.toString()
        };
        const rpOrder = await razorpay.orders.create(options);
        finalRazorpayOrderId = rpOrder.id;
      } catch (rpErr) {
        // Cleanup created order if integration fails
        await Order.findByIdAndDelete(order._id);
        return NextResponse.json({ error: `Razorpay Integration Error: ${rpErr.message}` }, { status: 502 });
      }
    } else {
      // Mock order creation for development environment without credentials
      finalRazorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Update order with the actual Razorpay Order ID
    order.razorpayOrderId = finalRazorpayOrderId;
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: finalRazorpayOrderId,
      amount: finalAmount,
      currency: 'INR',
      grandTotal
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
