import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Product from '@/backend/models/Product';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';

// Retrieve individual product by ID or Slug with live pricing calculations
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    let product = null;
    
    // Check if parameter is a valid Mongoose ObjectId, otherwise search by slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id)
        .populate('category', 'name slug')
        .populate('collectionRef', 'name slug');
    } else {
      product = await Product.findOne({ slug: id })
        .populate('category', 'name slug')
        .populate('collectionRef', 'name slug');
    }

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const pricing = await calculateLiveProductPrice(product);

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        pricing
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update product (Admin only)
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    // Verify authentication and role
    const user = await authenticate(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    } else {
      product = await Product.findOneAndUpdate({ slug: id }, body, { new: true, runValidators: true });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const pricing = await calculateLiveProductPrice(product);

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        pricing
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deactivate or Delete product (Admin only)
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // Verify authentication and role
    const user = await authenticate(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Soft-delete for referential integrity
      product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } else {
      product = await Product.findOneAndUpdate({ slug: id }, { isActive: false }, { new: true });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
