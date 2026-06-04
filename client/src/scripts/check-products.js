const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to configure custom DNS servers in Node.js:', e.message);
}

const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent += fs.readFileSync(envLocalPath, 'utf8') + '\n';
}
if (fs.existsSync(envPath)) {
  envContent += fs.readFileSync(envPath, 'utf8') + '\n';
}

let mongodbUri = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('MONGODB_URI=')) {
    mongodbUri = line.split('MONGODB_URI=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!mongodbUri) {
  mongodbUri = 'mongodb://localhost:27017/mip_jewellers';
}

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: Number,
  metalType: String,
  metalPurity: String,
});

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully.');

    const products = await Product.find({}).populate('category');
    console.log(`Total products in DB: ${products.length}`);
    products.forEach(p => {
      console.log(`- Product Name: ${p.name}, SKU: ${p.sku}, Category: ${p.category ? p.category.name : 'None'}, Stock: ${p.stock}, Metal: ${p.metalPurity} ${p.metalType}`);
      console.log(`  Images: ${JSON.stringify(p.images)}`);
    });

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

run();
