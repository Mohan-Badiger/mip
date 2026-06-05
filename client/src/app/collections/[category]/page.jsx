import React, { cache } from 'react';
import Link from 'next/link';
import dbConnect from '@/backend/config/dbConnect';
import Category from '@/backend/models/Category';
import Product from '@/backend/models/Product';
import GoldRate from '@/backend/models/GoldRate';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';
import CategoryClient from './CategoryClient';
import PageLayout from '@/components/global/PageLayout';

export const revalidate = 30; // Revalidate every 30 seconds

export async function generateStaticParams() {
  return [
    { category: 'earrings' },
    { category: 'bangles' },
    { category: 'chains' },
    { category: 'rings' },
    { category: 'coins-bars' },
    { category: 'necklaces' }
  ];
}

const HERO_IMAGES = {
  earrings: '/images/hero_slide_1.webp',
  bangles: '/images/category_bangles_1779203423031.png',
  chains: '/images/luxury_gold_hero_1779199654262.png',
  rings: '/images/modern_diamonds_1779199687171.png',
  'coins-bars': '/images/hero_slide_3.webp',
  necklaces: '/images/hero_slide_4.webp',
};

const getCategoryData = cache(async (slug) => {
  try {
    await dbConnect();
    return await Category.findOne({ slug });
  } catch (err) {
    console.error('Failed to load category on server:', err);
    return null;
  }
});


async function getCategoryProducts(categoryId) {
  try {
    await dbConnect();
    const productsList = await Product.find({ category: categoryId, isActive: true })
      .populate('category', 'name slug');

    // Pre-fetch rates in bulk to avoid N+1 query issue
    const rates = await GoldRate.find({});

    return await Promise.all(
      productsList.map(async (p) => {
        const pricing = await calculateLiveProductPrice(p, rates);
        return {
          id: p._id.toString(),
          slug: p.slug,
          name: p.name,
          image: p.images[0] || '/images/placeholder.webp',
          price: pricing.finalPrice,
          weight: p.metalWeight + 'g',
          metal: `${p.metalPurity} ${p.metalType.charAt(0).toUpperCase() + p.metalType.slice(1)}`,
          stone: p.gemstones && p.gemstones[0] ? (p.gemstones[0].type.charAt(0).toUpperCase() + p.gemstones[0].type.slice(1)) : null,
          tag: p.tag || (p.stock < 3 ? 'Low Stock' : null)
        };
      })
    );
  } catch (err) {
    console.error('Failed to load category products on server:', err);
    return [];
  }
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = await getCategoryData(category);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';

  if (!cat) {
    return {
      title: 'Category Not Found | MIP Jewellers',
      description: 'The requested category of jewelry pieces could not be found.',
    };
  }

  const title = `Exclusive ${cat.name} Collection | MIP Jewellers`;
  const description = cat.description || `Browse our exclusive luxury handcrafted ${cat.name.toLowerCase()} catalog. Every piece is 100% BIS 916 hallmarked for pure authenticity.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/collections/${cat.slug}`,
      images: [
        {
          url: cat.image || HERO_IMAGES[cat.slug] || '/images/placeholder.webp',
          alt: cat.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cat.image || HERO_IMAGES[cat.slug] || '/images/placeholder.webp'],
    }
  };
}

// 2. Server Component Entry
export default async function CategoryPage({ params }) {
  const { category } = await params;
  const cat = await getCategoryData(category);

  if (!cat) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-secondary text-2xl text-brand-brown">Category not found</p>
        </div>
      </PageLayout>
    );
  }

  const products = await getCategoryProducts(cat._id);
  const heroImage = cat.image || HERO_IMAGES[cat.slug] || '/images/exquisite_model_1779203407757.png';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';

  // 3. Dynamic JSON-LD CollectionPage Schema for SEO Rich snippets
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `MIP Jewellers ${cat.name} Collection`,
    "url": `${baseUrl}/collections/${cat.slug}`,
    "description": cat.description || `Shop our handcrafted luxury ${cat.name.toLowerCase()} collection online.`,
    "numberOfItems": products.length,
    "itemListElement": products.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/products/${p.slug}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CategoryClient 
        categorySlug={cat.slug} 
        categoryLabel={cat.name} 
        categoryDescription={cat.description} 
        categoryImage={heroImage} 
        products={products} 
      />
    </>
  );
}
