const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Bypass local DNS SRV errors if any
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to configure custom DNS servers in Node.js:', e.message);
}

// 1. Read environmental variables from env files
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent += fs.readFileSync(envLocalPath, 'utf8') + '\n';
}
if (fs.existsSync(envPath)) {
  envContent += fs.readFileSync(envPath, 'utf8') + '\n';
}

const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
}

const mongodbUri = env.MONGODB_URI || 'mongodb://localhost:27017/mip_jewellers';
const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary environment variables not found in .env files.');
  process.exit(1);
}

// 2. Initialize Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// 3. Define schemas
const GemstoneSchema = new mongoose.Schema({
  type: String,
  carat: Number,
  clarity: String,
  color: String,
  cut: String,
  value: Number
});

const ProductSchema = new mongoose.Schema({
  sku: String,
  name: String,
  slug: String,
  description: String,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  metalType: String,
  metalPurity: String,
  metalWeight: Number,
  gemstones: [GemstoneSchema],
  stock: Number,
  tag: String,
  certification: String,
  isActive: Boolean,
  gender: String
});

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Paths to the generated images
const localImages = {
  earrings: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_earrings_1780594685961.png',
  bangles: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_bangles_1780594704778.png',
  chains: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_chains_1780594719760.png',
  rings: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_rings_1780594735846.png',
  'coins-bars': 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_coins_1780594753665.png',
  necklaces: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\premium_necklaces_1780594770167.png'
};

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected');

    // 4. Upload local premium images to Cloudinary
    const cloudinaryUrls = {};
    for (const [key, filepath] of Object.entries(localImages)) {
      if (!fs.existsSync(filepath)) {
        console.error(`❌ Image file not found: ${filepath}`);
        process.exit(1);
      }
      console.log(`📤 Uploading ${key} premium image to Cloudinary...`);
      const res = await cloudinary.uploader.upload(filepath, {
        folder: 'mip_jewellers/premium'
      });
      cloudinaryUrls[key] = res.secure_url;
      console.log(`✅ Uploaded ${key}: ${res.secure_url}`);
    }

    // 5. Update Categories Banner Images
    const categories = await Category.find({});
    console.log(`\n📂 Updating ${categories.length} categories...`);
    for (const cat of categories) {
      const cloudUrl = cloudinaryUrls[cat.slug];
      if (cloudUrl) {
        cat.image = cloudUrl;
        await cat.save();
        console.log(`✨ Updated category [${cat.slug}] banner image.`);
      }
    }

    // 6. Update Products Specifications and Images
    const products = await Product.find({}).populate('category');
    console.log(`\n💎 Updating ${products.length} products...`);
    let count = 0;

    for (const prod of products) {
      if (!prod.category) {
        console.log(`⚠️ Product "${prod.name}" (SKU: ${prod.sku}) has no category associated. Skipping image update.`);
        continue;
      }
      
      const catSlug = prod.category.slug;
      const cloudUrl = cloudinaryUrls[catSlug];
      
      if (cloudUrl) {
        // Set Cloudinary image
        prod.images = [cloudUrl];
        
        // Assign accurate certification details
        let cert = 'BIS HALLMARK 916';
        if (prod.metalType === 'gold') {
          if (prod.metalPurity === '18KT') cert = 'BIS HALLMARK 750';
          else if (prod.metalPurity === '24KT') cert = 'BIS HALLMARK 999';
          else cert = 'BIS HALLMARK 916';
        } else if (prod.metalType === 'platinum') {
          cert = '950 PLATINUM PURITY CERTIFIED';
        } else if (prod.metalType === 'silver') {
          cert = '950 SILVER PURITY CERTIFIED';
        }

        // Diamond / Gemstone override
        if (prod.gemstones && prod.gemstones.length > 0) {
          const mainGem = prod.gemstones[0].type.toLowerCase();
          if (mainGem === 'diamond') {
            cert = 'GIA / IGI CERTIFIED DIAMOND';
          } else {
            cert = `SGL CERTIFIED ${mainGem.toUpperCase()}`;
          }
        }
        
        prod.certification = cert;
        
        // Update stock quantity to a realistic value
        prod.stock = Math.floor(Math.random() * 16) + 5; // random between 5 and 20
        
        await prod.save();
        console.log(`✨ Updated product [${prod.sku}] - "${prod.name}" | Cert: ${cert} | Stock: ${prod.stock}`);
        count++;
      }
    }

    console.log(`\n🎉 Successfully updated ${count} products in MongoDB.`);
    
    // Output URL mapping so we can copy-paste to products.js
    console.log('\n🔗 CLOUDINARY URLS MAP FOR products.js:');
    console.log(JSON.stringify(cloudinaryUrls, null, 2));

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database.');
  }
}

run();
