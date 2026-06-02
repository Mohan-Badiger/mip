import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/backend/config/dbConnect';
import Cart from '@/backend/models/Cart';
import Order from '@/backend/models/Order';
import Settings from '@/backend/models/Settings';
import Coupon from '@/backend/models/Coupon';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/backend/config/env';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, paymentMethod, promoCode } = await req.json();
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

    // Fetch active settings
    const activeSettings = await Settings.findOne() || {};
    const freeShippingThreshold = activeSettings.freeShippingThreshold ?? 50000;
    const shippingCharge = activeSettings.shippingCharge ?? 250;
    const insuranceFee = activeSettings.insuranceFee ?? 150;
    const codAllowed = activeSettings.codAllowed ?? true;
    const codLimit = activeSettings.codLimit ?? 20000;
    const codExtraCharge = activeSettings.codExtraCharge ?? 100;

    // Apply shipping & insurance
    const shippingFee = grandTotal >= freeShippingThreshold ? 0 : shippingCharge;
    grandTotal += shippingFee + insuranceFee;

    // Apply COD surcharge & validation
    if (paymentMethod === 'cod') {
      if (!codAllowed) {
        return NextResponse.json({ error: 'Cash on Delivery is currently disabled' }, { status: 400 });
      }
      if (grandTotal > codLimit) {
        return NextResponse.json({ error: `Cash on Delivery is not allowed for orders exceeding ₹${codLimit.toLocaleString('en-IN')}` }, { status: 400 });
      }
      grandTotal += codExtraCharge;
    }

    // Apply coupon discount if promoCode is provided
    let discountAmount = 0;
    let validCouponCode = null;

    if (promoCode) {
      const coupon = await Coupon.findOne({ code: promoCode.trim().toUpperCase(), isActive: true });
      if (coupon) {
        const isNotExpired = new Date(coupon.expiryDate) >= new Date();
        const meetsMinCart = grandTotal >= coupon.minCartValue;
        
        let valid = isNotExpired && meetsMinCart;

        if (valid && coupon.firstTimeOnly) {
          const orderCount = await Order.countDocuments({
            user: user._id,
            orderStatus: { $ne: 'cancelled' }
          });
          if (orderCount > 0) {
            valid = false;
          }
        }

        if (valid) {
          validCouponCode = coupon.code;
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round(grandTotal * (coupon.discountValue / 100));
          } else if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
          } else if (coupon.discountType === 'free-making') {
            let totalMakingChargesSaved = 0;
            const gstRate = activeSettings.gstRate ?? 3.0;

            for (const cartItem of cart.items) {
              if (cartItem.product && cartItem.product.isActive) {
                const pricing = await calculateLiveProductPrice(cartItem.product);
                const rawMetalValue = pricing.rawMetalValue;
                const stoneValue = pricing.stoneValue;
                const basePriceWithoutMaking = rawMetalValue + stoneValue;
                const taxWithoutMaking = basePriceWithoutMaking * (gstRate / 100);
                const finalPriceWithoutMaking = Math.round(basePriceWithoutMaking + taxWithoutMaking);
                totalMakingChargesSaved += (pricing.finalPrice - finalPriceWithoutMaking) * cartItem.quantity;
              }
            }
            discountAmount = totalMakingChargesSaved || coupon.discountValue || 1000;
          }
          discountAmount = Math.min(discountAmount, grandTotal);
        }
      }
    }

    grandTotal = Math.max(0, grandTotal - discountAmount);

    // 3. Initialize Order record (generate a placeholder first to get _id)
    const tempRazorpayOrderId = `temp_rp_${Math.random().toString(36).substring(7)}`;
    const order = new Order({
      user: user._id,
      items: orderItems,
      shippingAddress,
      subTotal,
      taxAmount,
      grandTotal,
      couponCode: validCouponCode,
      discountAmount,
      razorpayOrderId: tempRazorpayOrderId,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'card',
      orderStatus: 'received'
    });

    await order.save();

    // 4. Connect to Razorpay
    const key_id = RAZORPAY_KEY_ID;
    const key_secret = RAZORPAY_KEY_SECRET;
    let finalRazorpayOrderId = '';
    let finalAmount = grandTotal * 100;

    if (key_id && key_secret) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        
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
