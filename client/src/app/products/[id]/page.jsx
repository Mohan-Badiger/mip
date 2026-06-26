import React, { cache } from 'react';
import Link from 'next/link';
import dbConnect from '@/backend/config/dbConnect';
import Product from '@/backend/models/Product';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import ProductClient from './ProductClient';
import PageLayout from '@/components/global/PageLayout';

export const revalidate = 30; // Revalidate every 30 seconds

const getProductData = cache(async (id) => {
  try {
    await dbConnect();
    let product = null;
    
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
      return null;
    }

    const pricing = await calculateLiveProductPrice(product);
    return {
      ...product.toObject(),
      pricing
    };
  } catch (err) {
    console.error('Failed to load product data on server:', err);
    return null;
  }
});


async function getRelatedProducts(product) {
  try {
    await dbConnect();
    const relatedList = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(5);

    return await Promise.all(
      relatedList.map(async (p) => {
        const pricing = await calculateLiveProductPrice(p);
        return {
          id: p._id.toString(),
          slug: p.slug,
          name: p.name,
          image: p.images[0] || '/images/placeholder.webp',
          price: pricing.finalPrice
        };
      })
    );
  } catch (err) {
    console.error('Failed to load related products on server:', err);
    return [];
  }
}

async function getBestSellers(product, limit = 5, excludeIds = []) {
  try {
    await dbConnect();
    // 1. Fetch storewide bestseller products (excluding current product and category products already shown)
    let list = await Product.find({
      tag: 'Bestseller',
      _id: { $nin: [...excludeIds, product._id] },
      isActive: true
    }).limit(limit);

    // 2. If we need more, fallback to other active products in the store (excluding current, related and found bestsellers)
    if (list.length < limit) {
      const currentIds = list.map(p => p._id);
      const remainingLimit = limit - list.length;
      const fallbackList = await Product.find({
        _id: { $nin: [...excludeIds, ...currentIds, product._id] },
        isActive: true
      }).limit(remainingLimit);
      list = [...list, ...fallbackList];
    }

    return await Promise.all(
      list.map(async (p) => {
        const pricing = await calculateLiveProductPrice(p);
        return {
          id: p._id.toString(),
          slug: p.slug,
          name: p.name,
          image: p.images[0] || '/images/placeholder.webp',
          price: pricing.finalPrice
        };
      })
    );
  } catch (err) {
    console.error('Failed to load bestseller products on server:', err);
    return [];
  }
}

// 1. Server-side Dynamic SEO Metadata Generation
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductData(id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';

  if (!product) {
    return {
      title: 'Product Not Found | MIP Jewellers',
      description: 'The requested luxury jewelry piece could not be found.',
    };
  }

  const categoryName = product.category?.name || 'Jewellery';
  const title = `${product.name} | Buy ${product.metalPurity} Gold ${categoryName} | MIP Jewellers`;
  const description = product.description || `Handcrafted ${product.name} made from certified ${product.metalPurity} ${product.metalType} by MIP Jewellers. Buy online with BIS 916 Hallmarking.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${product.slug}`,
      images: [
        {
          url: product.images[0] || '/images/placeholder.webp',
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.images[0] || '/images/placeholder.webp'],
    }
  };
}

// 2. Server Component Entry Point
export default async function ProductPage({ params }) {
  const { id } = await params;
  const rawProduct = await getProductData(id);

  if (!rawProduct) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="font-secondary text-3xl text-brand-brown mb-4">Product not found</p>
            <Link href="/products" className="font-primary text-sm text-brand-gold underline">Browse All Jewellery</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Pre-serialize dynamic fields for client component consumption
  const product = {
    id: rawProduct._id.toString(),
    slug: rawProduct.slug,
    name: rawProduct.name,
    image: rawProduct.images[0] || '/images/placeholder.webp',
    price: rawProduct.pricing?.finalPrice || rawProduct.price,
    weight: rawProduct.metalWeight + 'g',
    metal: `${rawProduct.metalPurity} ${rawProduct.metalType.charAt(0).toUpperCase() + rawProduct.metalType.slice(1)}`,
    stone: rawProduct.gemstones && rawProduct.gemstones[0] ? (rawProduct.gemstones[0].type.charAt(0).toUpperCase() + rawProduct.gemstones[0].type.slice(1)) : null,
    tag: rawProduct.tag || (rawProduct.stock < 3 ? 'Low Stock' : null),
    category: rawProduct.category?.slug || '',
    categoryLabel: rawProduct.category?.name || '',
    description: rawProduct.description
  };

  const related = await getRelatedProducts(rawProduct);
  const relatedIds = related.map(p => p.id);
  const bestsellers = await getBestSellers(rawProduct, 5, relatedIds);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';
  
  // 3. Dynamic JSON-LD Product Schema for SEO Rich Snippets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": rawProduct.images,
    "description": product.description,
    "sku": rawProduct.sku,
    "mpn": rawProduct.sku,
    "brand": {
      "@type": "Brand",
      "name": "MIP Jewellers"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": rawProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      // eslint-disable-next-line react-hooks/purity
      "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Valid 1 week
    }
  };

  return (
    <>
      {/* Server side inject JSON-LD Product schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductClient 
        product={product} 
        rawProduct={JSON.parse(JSON.stringify(rawProduct))} 
        related={related} 
        bestsellers={bestsellers}
      />
    </>
  );
}
