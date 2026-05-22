import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Product from '@/backend/models/Product';
import Category from '@/backend/models/Category';
import Collection from '@/backend/models/Collection';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const categoryParam = searchParams.get('category');
    const collectionParam = searchParams.get('collection');
    const metalType = searchParams.get('metalType');
    const metalPurity = searchParams.get('metalPurity');
    const searchQuery = searchParams.get('search');

    const query = { isActive: true };

    // Resolve Category if provided by ID or Slug
    if (categoryParam) {
      let cat = null;
      if (categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
        cat = await Category.findById(categoryParam);
      } else {
        cat = await Category.findOne({ slug: categoryParam });
      }
      if (cat) {
        query.category = cat._id;
      } else {
        // Category filter provided but not found, return empty results early
        return NextResponse.json({
          success: true,
          products: [],
          pagination: { total: 0, page, pages: 0 }
        });
      }
    }

    // Resolve Collection if provided by ID or Slug
    if (collectionParam) {
      let col = null;
      if (collectionParam.match(/^[0-9a-fA-F]{24}$/)) {
        col = await Collection.findById(collectionParam);
      } else {
        col = await Collection.findOne({ slug: collectionParam });
      }
      if (col) {
        query.collectionRef = col._id;
      } else {
        // Collection filter provided but not found
        return NextResponse.json({
          success: true,
          products: [],
          pagination: { total: 0, page, pages: 0 }
        });
      }
    }

    // Metal filters
    if (metalType) {
      query.metalType = metalType.toLowerCase();
    }
    if (metalPurity) {
      query.metalPurity = metalPurity.toUpperCase();
    }

    // Full-Text Search / Regex Search fallback for search matching
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    // Fetch products
    const total = await Product.countDocuments(query);
    const productsList = await Product.find(query)
      .populate('category', 'name slug')
      .populate('collectionRef', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort(searchQuery ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    // Dynamic Price Lock Calculation for luxury catalog items
    const productsWithLivePrices = await Promise.all(
      productsList.map(async (product) => {
        const pricing = await calculateLiveProductPrice(product);
        return {
          ...product.toObject(),
          pricing
        };
      })
    );

    return NextResponse.json({
      success: true,
      products: productsWithLivePrices,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    // Check Authorization: Admin only
    const user = await authenticate(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const product = new Product(body);
    await product.save();

    const pricing = await calculateLiveProductPrice(product);

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        pricing
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
