import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { logAdminAction } from '@/lib/auditLogger';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check if category with same slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Category with similar name already exists' }, { status: 400 });
    }

    const category = await Category.create({
      name: body.name,
      slug,
      description: body.description || '',
      image: body.image || ''
    });

    // Log admin action
    await logAdminAction(req, {
      action: 'CREATE',
      entity: 'Category',
      entityId: category._id,
      description: `Created category "${category.name}" (slug: ${category.slug})`,
      changes: category.toObject()
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, name, description, image } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Category ID (_id) is required for update' }, { status: 400 });
    }

    const category = await Category.findById(_id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (name !== undefined && name !== category.name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const existing = await Category.findOne({ slug: updates.slug, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Category with similar name already exists' }, { status: 400 });
      }
    }

    const originalCategory = category.toObject();
    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Category',
      entityId: _id,
      description: `Updated category "${updatedCategory.name}"`,
      changes: {
        original: originalCategory,
        updated: updatedCategory.toObject()
      }
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID (id) parameter is required for deletion' }, { status: 400 });
    }

    // Check if category is referenced by any products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete category: it has ${productCount} associated product(s). Please move or delete the products first.`
      }, { status: 400 });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'Category',
      entityId: id,
      description: `Deleted category "${deletedCategory.name}"`,
      changes: deletedCategory.toObject()
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully', data: deletedCategory });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
