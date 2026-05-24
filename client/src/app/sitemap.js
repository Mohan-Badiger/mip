import dbConnect from '@/backend/config/dbConnect';
import Product from '@/backend/models/Product';
import Category from '@/backend/models/Category';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';

  // Static/Base routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/stores',
    '/purchase-plan',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    await dbConnect();
    
    // Fetch categories dynamically from database
    const categories = await Category.find({}).select('slug updatedAt');
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/collections/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch active products dynamically from database
    const products = await Product.find({ isActive: true }).select('slug updatedAt');
    const productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return routes;
  }
}
