import CollectionsShowcase from '@/components/collections/CollectionsShowcase';
import dbConnect from '@/backend/config/dbConnect';
import Collection from '@/backend/models/Collection';
import Product from '@/backend/models/Product';
import GoldRate from '@/backend/models/GoldRate';
import { calculateLiveProductPrice } from '@/backend/services/pricingService';

export const revalidate = 30; // Revalidate every 30 seconds

export const metadata = {
  title: 'Our Collections | MIP Jewellers',
  description: 'Explore MIP\'s exquisite themed campaign collections and luxury handcrafted jewellery series.',
};

export default async function CollectionsPage() {
  let dbCollections = [];
  try {
    await dbConnect();
    const rawCollections = await Collection.find({}).lean();
    const rates = await GoldRate.find({});

    dbCollections = await Promise.all(
      rawCollections.map(async (col) => {
        const productsList = await Product.find({ collectionRef: col._id, isActive: true }).limit(3);
        const mappedProducts = await Promise.all(
          productsList.map(async (p) => {
            const pricing = await calculateLiveProductPrice(p, rates);
            return {
              name: p.name,
              type: `${p.metalPurity} ${p.metalType.charAt(0).toUpperCase() + p.metalType.slice(1)}`,
              price: `₹${pricing.finalPrice.toLocaleString("en-IN")}*`
            };
          })
        );
        return {
          ...col,
          featuredPieces: mappedProducts.length > 0 ? mappedProducts : undefined
        };
      })
    );
  } catch (err) {
    console.error("Failed to load collections showcase data:", err);
  }

  return <CollectionsShowcase collections={JSON.parse(JSON.stringify(dbCollections))} />;
}
