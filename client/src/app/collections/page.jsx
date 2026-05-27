import AllJewelleryCatalog from '@/components/collections/AllJewelleryCatalog';
import CollectionsShowcase from '@/components/collections/CollectionsShowcase';
import dbConnect from '@/backend/config/dbConnect';
import Collection from '@/backend/models/Collection';

export const metadata = {
  title: 'Our Collections | MIP Jewellers',
  description: 'Explore MIP\'s exquisite themed campaign collections and luxury handcrafted jewellery series.',
};

export default async function CollectionsPage({ searchParams }) {
  const params = await searchParams;
  
  // Check if there are any filter query params
  const hasFilter = params.category || params.collection || params.gender || params.search || params.all;
  
  if (hasFilter) {
    return <AllJewelleryCatalog />;
  }

  let dbCollections = [];
  try {
    await dbConnect();
    dbCollections = await Collection.find({}).lean();
  } catch (err) {
    console.error("Failed to load collections showcase data:", err);
  }

  return <CollectionsShowcase collections={JSON.parse(JSON.stringify(dbCollections))} />;
}
