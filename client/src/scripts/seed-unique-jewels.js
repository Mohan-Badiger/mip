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

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

const ProductSchema = new mongoose.Schema({
  sku: String,
  slug: String,
  name: String,
  images: [String]
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const localImages = {
  e1: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e1_lotus_drops_1780595052551.png',
  e2: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e2_classic_jhumka_1780595074814.png',
  e3: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e3_pearl_studs_1780595092347.png',
  e4: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e4_chandbali_1780595111898.png',
  e5: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e5_floral_studs_1780595129575.png',
  e6: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\e6_temple_jhumka_1780595148709.png',
  b1: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\b1_classic_bangle_1780595165499.png',
  b2: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\b2_diamond_bangle_1780595180564.png',
  b3: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\b3_temple_kada_1780595198793.png',
  b4: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\b4_floral_bangle_1780595215094.png',
  b5: 'C:\\Users\\mohan\\.gemini\\antigravity-ide\\brain\\8258378e-4d9b-4068-9e74-d495316d01ad\\b5_ruby_bangle_1780595233609.png'
};

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected');

    // 1. Upload local unique images to Cloudinary
    const uploadedUrls = {};
    for (const [key, filepath] of Object.entries(localImages)) {
      if (fs.existsSync(filepath)) {
        console.log(`📤 Uploading unique image for ${key} to Cloudinary...`);
        const res = await cloudinary.uploader.upload(filepath, {
          folder: 'mip_jewellers/unique'
        });
        uploadedUrls[key] = res.secure_url;
        console.log(`✅ Uploaded ${key}: ${res.secure_url}`);
      } else {
        console.warn(`⚠️ Warning: Image file not found at ${filepath}`);
      }
    }

    // Fallbacks from previous uploads
    const originalChains = "https://res.cloudinary.com/dlnajukqk/image/upload/v1780594803/mip_jewellers/premium/smamryqbfmzh0zchgnpz.jpg";
    const originalRings = "https://res.cloudinary.com/dlnajukqk/image/upload/v1780594804/mip_jewellers/premium/sugbfup0cpqbmw22h9nw.jpg";
    const originalCoins = "https://res.cloudinary.com/dlnajukqk/image/upload/v1780594806/mip_jewellers/premium/sxcv8eebqnbfs3lwpogq.jpg";
    const originalNecklaces = "https://res.cloudinary.com/dlnajukqk/image/upload/v1780594808/mip_jewellers/premium/sr346hvhhh015hgzhxqs.jpg";
    const originalBangles = "https://res.cloudinary.com/dlnajukqk/image/upload/v1780594801/mip_jewellers/premium/m62lixzly2olf5lvmvis.jpg";

    // 2. Define the complete unique image map
    const imageMap = {
      // Earrings
      'lotus-diamond-drops': uploadedUrls.e1,
      'classic-jhumka': uploadedUrls.e2,
      'pearl-drop-studs': uploadedUrls.e3,
      'heritage-chandbali': uploadedUrls.e4,
      'floral-studs': uploadedUrls.e5,
      'temple-jhumka': uploadedUrls.e6,
      
      // Bangles
      'classic-gold-bangle': uploadedUrls.b1,
      'diamond-bangle': uploadedUrls.b2,
      'temple-kada': uploadedUrls.b3,
      'floral-bangle-pair': uploadedUrls.b4,
      'ruby-bangle': uploadedUrls.b5,
      'antique-bangle': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600', // Unique Unsplash bangle
      
      // Chains
      'singapore-chain': originalChains,
      'box-chain': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600',
      'figaro-chain': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600',
      'rope-chain': 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600',
      'diamond-chain': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600',
      'cable-chain': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600',

      // Rings
      'solitaire-diamond-ring': originalRings,
      'cluster-ring': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600',
      'plain-gold-ring': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600',
      'ruby-ring': 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?q=80&w=600',
      'eternity-band': 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=600',
      'temple-ring': 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=600',

      // Coins & Bars
      'lakshmi-coin-1g': originalCoins,
      'lakshmi-coin-5g': 'https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=600',
      'gold-bar-10g': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
      'gold-bar-20g': 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600',
      'ganesh-coin-2g': 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=600',
      'gold-coin-8g': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=600',

      // Necklaces
      'temple-necklace': originalNecklaces,
      'diamond-pendant-set': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600',
      'ruby-choker': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600',
      'long-gold-chain': 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600',
      'antique-haram': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600',
      'pearl-necklace': 'https://images.unsplash.com/photo-1505086708752-6e2794eb84e5?q=80&w=600'
    };

    // 3. Update products in database
    console.log('\n💎 Updating product images to make them completely unique...');
    const dbProducts = await Product.find({});
    let updatedCount = 0;

    for (const p of dbProducts) {
      const matchUrl = imageMap[p.slug];
      if (matchUrl) {
        p.images = [matchUrl];
        await p.save();
        console.log(`✨ Updated product image for: ${p.slug} -> ${matchUrl}`);
        updatedCount++;
      } else {
        console.warn(`⚠️ No unique image mapped for slug: ${p.slug}`);
      }
    }

    console.log(`\n🎉 Completed! Updated ${updatedCount} products in MongoDB.`);
    
    // Print out details for copy pasting to products.js mock data file
    console.log('\n🔗 UNIQUE IMAGE MAP DETAILS FOR copy pasting:');
    console.log(JSON.stringify(imageMap, null, 2));

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

run();
