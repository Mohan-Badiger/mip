import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/lib/models/Collection';
import Product from '@/lib/models/Product';
import { logAdminAction } from '@/lib/auditLogger';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    let collections = await Collection.find({}).sort({ name: 1 });
    
    // Auto-seed default collections if database is empty
    if (collections.length === 0) {
      const DEFAULT_COLLECTIONS = [
        {
          name: "Aradhana Collection",
          slug: "necklaces",
          description: "Inspired by our rich Indian royal traditions, featuring meticulously crafted heritage gold sets. Each piece reflects centuries of Nakashi and Kundan craftsmanship, tailored for the modern bride seeking timeless legacy.",
          bannerImage: "/images/category_necklaces.webp"
        },
        {
          name: "Sunshine Series",
          slug: "bangles",
          description: "Traditional kadas to modern stacks designed with gold craftsmanship made to last over time. Combining geometric purity with structural grace, these bangles are designed to be layered and cherished daily.",
          bannerImage: "/images/category_bangles.webp"
        },
        {
          name: "Kahani Bridal",
          slug: "rings",
          description: "Capturing wedding stories in gold, eternity bands, and premium solitaires designed for couples. Hand-selected diamonds of exceptional color and clarity, set in handcrafted gold and platinum to last a lifetime.",
          bannerImage: "/images/category_rings.webp"
        }
      ];
      await Collection.insertMany(DEFAULT_COLLECTIONS);
      collections = await Collection.find({}).sort({ name: 1 });
    }
    
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Collection name is required' }, { status: 400 });
    }

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if collection with same slug exists
    const existing = await Collection.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Collection with similar name already exists' }, { status: 400 });
    }

    const collection = await Collection.create({
      name: body.name,
      slug,
      description: body.description || '',
      bannerImage: body.bannerImage || '',
      imagePosition: body.imagePosition || '50%'
    });

    // Log admin action
    await logAdminAction(req, {
      action: 'CREATE',
      entity: 'Collection',
      entityId: collection._id,
      description: `Created collection "${collection.name}" (slug: ${collection.slug})`,
      changes: collection.toObject()
    });

    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, name, description, bannerImage, imagePosition } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Collection ID (_id) is required for update' }, { status: 400 });
    }

    const collection = await Collection.findById(_id);
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (bannerImage !== undefined) updates.bannerImage = bannerImage;
    if (imagePosition !== undefined) updates.imagePosition = imagePosition;
    if (name !== undefined && name !== collection.name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const existing = await Collection.findOne({ slug: updates.slug, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Collection with similar name already exists' }, { status: 400 });
      }
    }

    const originalCollection = collection.toObject();
    const updatedCollection = await Collection.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Collection',
      entityId: _id,
      description: `Updated collection "${updatedCollection.name}"`,
      changes: {
        original: originalCollection,
        updated: updatedCollection.toObject()
      }
    });

    return NextResponse.json({ success: true, data: updatedCollection });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager']);

export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Collection ID (id) parameter is required for deletion' }, { status: 400 });
    }

    const deletedCollection = await Collection.findByIdAndDelete(id);
    if (!deletedCollection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    // Set collectionRef to null for all products referencing this collection
    await Product.updateMany({ collectionRef: id }, { $set: { collectionRef: null } });

    // Log admin action
    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'Collection',
      entityId: id,
      description: `Deleted collection "${deletedCollection.name}"`,
      changes: deletedCollection.toObject()
    });

    return NextResponse.json({ success: true, message: 'Collection deleted successfully', data: deletedCollection });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
