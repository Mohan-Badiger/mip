import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/lib/models/Coupon';
import { withAuth } from '@/lib/withAuth';
import { logAdminAction } from '@/lib/auditLogger';

// GET - List all coupons
export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

// POST - Create a new coupon
export const POST = withAuth(async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { code, discountType, discountValue, minCartValue, description, expiryDate, firstTimeOnly } = body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json({ success: false, error: 'Code, discount type, value, and expiry date are required.' }, { status: 400 });
    }

    const codeUpper = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: codeUpper });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A coupon with this code already exists.' }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: codeUpper,
      discountType,
      discountValue: Number(discountValue),
      minCartValue: Number(minCartValue) || 0,
      description,
      expiryDate: new Date(expiryDate),
      isActive: true,
      firstTimeOnly: !!firstTimeOnly
    });

    await logAdminAction(req, {
      action: 'CREATE',
      entity: 'Coupon',
      entityId: newCoupon._id,
      description: `Created coupon code "${codeUpper}"`,
    });

    return NextResponse.json({ success: true, data: newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager', 'cms-editor']);

// PUT - Update an existing coupon
export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, isActive, code, discountType, discountValue, minCartValue, description, expiryDate, firstTimeOnly } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Coupon ID (_id) is required.' }, { status: 400 });
    }

    const coupon = await Coupon.findById(_id);
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found.' }, { status: 404 });
    }

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (code !== undefined) updates.code = code.trim().toUpperCase();
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (minCartValue !== undefined) updates.minCartValue = Number(minCartValue);
    if (description !== undefined) updates.description = description;
    if (expiryDate !== undefined) updates.expiryDate = new Date(expiryDate);
    if (firstTimeOnly !== undefined) updates.firstTimeOnly = !!firstTimeOnly;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Coupon',
      entityId: _id,
      description: `Updated coupon "${updatedCoupon.code}"`,
    });

    return NextResponse.json({ success: true, data: updatedCoupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager', 'cms-editor']);

// DELETE - Remove a coupon
export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID (id) parameter is required.' }, { status: 400 });
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found.' }, { status: 404 });
    }

    await Coupon.findByIdAndDelete(id);

    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'Coupon',
      entityId: id,
      description: `Deleted coupon "${coupon.code}"`,
    });

    return NextResponse.json({ success: true, message: 'Coupon removed successfully.' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager', 'cms-editor']);
