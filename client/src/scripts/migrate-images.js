const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Configure Node's DNS resolver to query Google's public DNS servers
// to bypass local network resolution blocks on MongoDB Atlas SRV lookups.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to configure custom DNS servers in Node.js:', e.message);
}

// 1. Read environmental variable from .env manually
const envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.error(`Error: .env file not found at ${envPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
let mongodbUri = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('MONGODB_URI=')) {
    // Extract everything after MONGODB_URI=, removing quotes
    mongodbUri = line.split('MONGODB_URI=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!mongodbUri) {
  // Try fallback to local db
  mongodbUri = 'mongodb://localhost:27017/mip_jewellers';
  console.log(`MONGODB_URI not found in .env. Falling back to default: ${mongodbUri}`);
} else {
  console.log(`Found MONGODB_URI: ${mongodbUri.replace(/\/\/.*@/, '//****:****@')}`);
}

// 2. Define mongoose schemas
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  sku: String,
  name: String,
  slug: String,
  images: [String]
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Mappings for updates
const mappings = {
  'bridal_jewellery_1779199671286.png': 'category_necklaces.png',
  'category_bangles_1779203423031.png': 'category_bangles.png',
  'exquisite_model_1779203407757.png': 'exquisite_model.png',
  'hero_model_scheme_1779204168417.png': 'category_coins.png',
  'luxury_gold_hero_1779199654262.png': 'category_chains.png',
  'modern_diamonds_1779199687171.png': 'category_rings.png',
  'product_earrings_1.png': 'category_earrings.png',
};

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully.');

    // 3. Migrate Categories
    const categories = await Category.find({});
    console.log(`Checking ${categories.length} categories...`);
    let categoryUpdates = 0;
    
    for (const cat of categories) {
      if (cat.image) {
        let updated = false;
        let imagePath = cat.image;
        
        for (const [oldName, newName] of Object.entries(mappings)) {
          if (imagePath.includes(oldName)) {
            imagePath = imagePath.replace(oldName, newName);
            updated = true;
          }
        }
        
        if (updated) {
          cat.image = imagePath;
          await cat.save();
          console.log(`Updated Category [${cat.slug}]: image -> ${imagePath}`);
          categoryUpdates++;
        }
      }
    }

    // 4. Migrate Products
    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);
    let productUpdates = 0;

    for (const prod of products) {
      if (Array.isArray(prod.images) && prod.images.length > 0) {
        let updated = false;
        const newImages = prod.images.map(img => {
          let updatedImg = img;
          for (const [oldName, newName] of Object.entries(mappings)) {
            if (updatedImg.includes(oldName)) {
              updatedImg = updatedImg.replace(oldName, newName);
              updated = true;
            }
          }
          return updatedImg;
        });

        if (updated) {
          prod.images = newImages;
          await prod.save();
          console.log(`Updated Product [${prod.sku} - ${prod.slug}]: images -> ${JSON.stringify(newImages)}`);
          productUpdates++;
        }
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Categories updated: ${categoryUpdates}`);
    console.log(`Products updated: ${productUpdates}`);

  } catch (err) {
    console.error('Migration failed with error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

runMigration();
