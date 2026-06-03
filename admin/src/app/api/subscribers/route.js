import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber';
import { withAuth } from '@/lib/withAuth';
import { logAdminAction } from '@/lib/auditLogger';

export const GET = withAuth(async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let filter = {};
    if (search) {
      filter = {
        email: { $regex: search, $options: 'i' }
      };
    }

    const subscribers = await Subscriber.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscriber ID (id) is required' }, { status: 400 });
    }

    const originalSubscriber = await Subscriber.findById(id);
    if (!originalSubscriber) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    }

    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      id,
      { $set: { active } },
      { new: true, runValidators: true }
    );

    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Subscriber',
      entityId: id,
      description: `Updated subscriber status of "${updatedSubscriber.email}" to ${active ? 'Active' : 'Inactive'}`,
      changes: {
        original: originalSubscriber.toObject(),
        updated: updatedSubscriber.toObject()
      }
    });

    return NextResponse.json({ success: true, data: updatedSubscriber });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'sales-rep']);

export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscriber ID (id) parameter is required for deletion' }, { status: 400 });
    }

    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
    }

    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'Subscriber',
      entityId: id,
      description: `Deleted subscriber "${deletedSubscriber.email}"`,
      changes: deletedSubscriber.toObject()
    });

    return NextResponse.json({ success: true, message: 'Subscriber deleted successfully', data: deletedSubscriber });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
