import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Collection from '@/lib/models/Collection';
import { logAdminAction } from '@/lib/auditLogger';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET(req) {
  try {
    await dbConnect();
    
    // Register schemas
    Category.name;
    Collection.name;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    
    if (id) {
      const product = await Product.findById(id)
        .populate('category')
        .populate('collectionRef');
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('category')
      .populate('collectionRef')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // Basic validation
    const required = [
      'name', 'description', 'category', 'metalType', 
      'metalPurity', 'metalWeight', 'makingChargeType', 'makingChargeValue'
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    // Generate unique SKU if not provided
    let sku = body.sku;
    if (!sku) {
      sku = 'MIP' + Date.now().toString().slice(-8);
    }

    // Generate Slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    // Check uniqueness
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return NextResponse.json({ success: false, error: `SKU '${sku}' already exists` }, { status: 400 });
    }
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ success: false, error: `Slug '${slug}' already exists` }, { status: 400 });
    }

    const newProduct = await Product.create({
      sku,
      name: body.name,
      slug,
      description: body.description,
      images: body.images && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600'],
      category: body.category,
      collectionRef: (body.collectionRef === 'none_ref' || body.collectionRef === 'none' || !body.collectionRef) ? null : body.collectionRef,
      metalType: body.metalType,
      metalPurity: body.metalPurity,
      metalWeight: Number(body.metalWeight),
      makingChargeType: body.makingChargeType,
      makingChargeValue: Number(body.makingChargeValue),
      gemstones: body.gemstones || [],
      stock: body.stock !== undefined ? Number(body.stock) : 1,
      tag: body.tag || '',
      certification: body.certification || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      gender: body.gender || 'Women'
    });

    // Log admin action
    await logAdminAction(req, {
      action: 'CREATE',
      entity: 'Product',
      entityId: newProduct._id,
      description: `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`,
      changes: newProduct.toObject()
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Product ID (_id) is required for updates' }, { status: 400 });
    }

    const originalProduct = await Product.findById(_id);
    if (!originalProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (updateData.collectionRef === 'none_ref' || updateData.collectionRef === 'none' || !updateData.collectionRef) {
      updateData.collectionRef = null;
    }

    // Validate fields if needed
    if (updateData.metalWeight) updateData.metalWeight = Number(updateData.metalWeight);
    if (updateData.makingChargeValue) updateData.makingChargeValue = Number(updateData.makingChargeValue);
    if (updateData.stock) updateData.stock = Number(updateData.stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Product',
      entityId: _id,
      description: `Updated product "${updatedProduct.name}" (SKU: ${updatedProduct.sku})`,
      changes: {
        original: originalProduct.toObject(),
        updated: updatedProduct.toObject()
      }
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID (id) parameter is required for deletion' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'Product',
      entityId: id,
      description: `Deleted product "${deletedProduct.name}" (SKU: ${deletedProduct.sku})`,
      changes: deletedProduct.toObject()
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully', data: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
