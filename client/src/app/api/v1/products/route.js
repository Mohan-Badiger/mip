import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Product from '@/backend/models/Product';
import Category from '@/backend/models/Category';
import Collection from '@/backend/models/Collection';
import GoldRate from '@/backend/models/GoldRate';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import { authenticate } from '@/backend/middlewares/authMiddleware';
import { categories as mockCategories, products as mockProducts } from '@/lib/products';

export async function GET(req) {
  try {
    await dbConnect();

    // Auto-seed Category and Product collections if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {

      // Ensure Gold Rates exist
      let rates = await GoldRate.find({});
      if (rates.length === 0) {
        const DEFAULT_RATES = [
          { metal: 'gold', purity: '18KT', pricePerGram: 6000 },
          { metal: 'gold', purity: '22KT', pricePerGram: 7200 },
          { metal: 'gold', purity: '24KT', pricePerGram: 7850 },
          { metal: 'silver', purity: '950PT', pricePerGram: 95 },
          { metal: 'platinum', purity: '950PT', pricePerGram: 3200 }
        ];
        await GoldRate.insertMany(DEFAULT_RATES);
        rates = await GoldRate.find({});
      }

      const getRate = (metal, purity) => {
        const rateRecord = rates.find(r => r.metal === metal && r.purity === purity);
        if (rateRecord) return rateRecord.pricePerGram;
        if (metal === 'gold') {
          if (purity === '18KT') return 6000;
          if (purity === '22KT') return 7200;
          if (purity === '24KT') return 7850;
        }
        if (metal === 'silver') return 95;
        if (metal === 'platinum') return 3200;
        return 5000;
      };

      // Seed Categories
      const categoryMap = {};
      for (const cat of mockCategories) {
        let dbCat = await Category.findOne({ slug: cat.slug });
        if (!dbCat) {
          dbCat = await Category.create({
            name: cat.label,
            slug: cat.slug,
            description: cat.description,
            image: cat.image
          });
        }
        categoryMap[cat.slug] = dbCat._id;
      }

      // Seed Products
      for (let i = 0; i < mockProducts.length; i++) {
        const mockP = mockProducts[i];
        const categoryId = categoryMap[mockP.category];
        if (!categoryId) continue;

        const weight = parseFloat(mockP.weight.replace(/[^\d.]/g, '')) || 5;

        let metalType = 'gold';
        let metalPurity = '22KT';
        const metalStr = mockP.metal.toLowerCase();
        if (metalStr.includes('silver')) {
          metalType = 'silver';
          metalPurity = '950PT';
        } else if (metalStr.includes('platinum')) {
          metalType = 'platinum';
          metalPurity = '950PT';
        } else {
          metalType = 'gold';
          if (metalStr.includes('18kt')) metalPurity = '18KT';
          else if (metalStr.includes('24kt')) metalPurity = '24KT';
          else metalPurity = '22KT';
        }

        const gemstones = [];
        let gemstoneValue = 0;
        if (mockP.stone) {
          const type = mockP.stone.toLowerCase();
          const value = type === 'diamond' ? 15000 : (type === 'ruby' ? 8000 : (type === 'pearl' ? 4000 : 3000));
          gemstones.push({
            type: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'].includes(type) ? type : 'diamond',
            carat: type === 'diamond' ? 0.25 : 1.0,
            value
          });
          gemstoneValue = value;
        }

        const rate = getRate(metalType, metalPurity);
        const rawMetalValue = weight * rate;
        const finalPrice = mockP.price;
        const basePrice = finalPrice / 1.03;
        const makingCharges = Math.max(100, basePrice - rawMetalValue - gemstoneValue);

        const sku = `MIP-${mockP.category.toUpperCase()}-${1000 + i}`;
        await Product.create({
          sku,
          name: mockP.name,
          slug: mockP.slug,
          description: `Luxurious handcrafted ${mockP.name} made of premium ${mockP.metal}. Perfect for weddings, celebrations, and festive occasions.`,
          images: [mockP.image],
          category: categoryId,
          metalType,
          metalPurity,
          metalWeight: weight,
          makingChargeType: 'flat_total',
          makingChargeValue: Math.round(makingCharges),
          gemstones,
          stock: 10,
          isActive: true
        });
      }
    }

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
