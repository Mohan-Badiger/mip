import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Cart from '@/backend/models/Cart';
import Product from '@/backend/models/Product';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';

// Fetch the authenticated user's cart with live recalculated prices
export async function GET(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let cart = await Cart.findOne({ user: user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug' }
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: { items: [] },
        summary: { subTotal: 0, tax: 0, grandTotal: 0 }
      });
    }

    let subTotal = 0;
    let tax = 0;
    let grandTotal = 0;

    const validatedItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        // Product was hard-deleted from database
        validatedItems.push({
          _id: item._id,
          isUnavailable: true,
          product: {
            _id: 'deleted-item-' + item._id,
            name: 'Product Unavailable',
            images: ['/images/placeholder.webp'],
            price: 0,
            metalWeight: 0,
            metalPurity: '',
            metalType: '',
            isActive: false,
            isUnavailable: true
          },
          quantity: item.quantity,
          itemTotal: 0
        });
        continue;
      }

      if (!item.product.isActive) {
        // Product is inactive (disabled by admin)
        validatedItems.push({
          _id: item._id,
          isUnavailable: true,
          product: {
            ...item.product.toObject(),
            isUnavailable: true
          },
          quantity: item.quantity,
          itemTotal: 0
        });
        continue;
      }

      const pricing = await calculateLiveProductPrice(item.product);
      const itemSubtotal = (pricing.rawMetalValue + pricing.makingCharges + pricing.gemstoneValue) * item.quantity;
      const itemTax = pricing.tax * item.quantity;
      const itemTotal = pricing.finalPrice * item.quantity;

      subTotal += itemSubtotal;
      tax += itemTax;
      grandTotal += itemTotal;

      validatedItems.push({
        _id: item._id,
        product: {
          ...item.product.toObject(),
          pricing
        },
        quantity: item.quantity,
        itemTotal
      });
    }

    return NextResponse.json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.user,
        items: validatedItems
      },
      summary: {
        subTotal: Math.round(subTotal),
        tax: Math.round(tax),
        grandTotal: Math.round(grandTotal)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Sync whole cart (overwrites database cart state with frontend local storage cart)
export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json(); // Array of { product: id, quantity: number }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid payload: items must be an array' }, { status: 400 });
    }

    // Filter valid products and format
    const formattedItems = [];
    for (const item of items) {
      const prod = await Product.findById(item.product);
      if (prod && prod.isActive) {
        formattedItems.push({
          product: prod._id,
          quantity: Math.max(1, parseInt(item.quantity) || 1)
        });
      }
    }

    await Cart.findOneAndUpdate(
      { user: user._id },
      { items: formattedItems },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Cart synced successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add or Update a single product's quantity in the cart
export async function PUT(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty)) {
      return NextResponse.json({ error: 'Quantity must be a valid integer' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (parsedQty <= 0) {
      // Remove item if quantity set to 0 or less
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = parsedQty;
      } else {
        cart.items.push({ product: productId, quantity: parsedQty });
      }
    }

    await cart.save();

    return NextResponse.json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Clear or delete items
export async function DELETE(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Delete single item from cart
      await Cart.updateOne(
        { user: user._id },
        { $pull: { items: { product: productId } } }
      );
      return NextResponse.json({ success: true, message: 'Item removed from cart' });
    } else {
      // Clear entire cart
      await Cart.deleteOne({ user: user._id });
      return NextResponse.json({ success: true, message: 'Cart cleared successfully' });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
