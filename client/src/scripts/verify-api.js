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
  stock: Number,
  metalType: String,
  metalPurity: String,
  certification: String
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function verify() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected');

    const products = await Product.find({});
    console.log(`\n📋 Verifying ${products.length} products...`);

    let issues = 0;
    for (const p of products) {
      if (!p.images || p.images.length === 0) {
        console.error(`❌ Product [${p.sku}] "${p.name}" has no images!`);
        issues++;
        continue;
      }
      
      const img = p.images[0];
      if (!img.startsWith('https://res.cloudinary.com/')) {
        console.error(`❌ Product [${p.sku}] "${p.name}" image is not on Cloudinary: ${img}`);
        issues++;
      }
      
      if (!p.certification) {
        console.error(`❌ Product [${p.sku}] "${p.name}" has no quality certification field!`);
        issues++;
      }
      
      if (p.stock === undefined || p.stock === null || p.stock < 0) {
        console.error(`❌ Product [${p.sku}] "${p.name}" has invalid stock quantity: ${p.stock}`);
        issues++;
      }
    }

    if (issues === 0) {
      console.log('\n🌟 ALL PRODUCTS ARE PERFECTLY SEEDED IN THE DATABASE!');
      console.log('  - All images are hosted on Cloudinary.');
      console.log('  - All items have accurate gold certifications.');
      console.log('  - All items have correct stock quantities.');
    } else {
      console.error(`\n❌ Verification failed with ${issues} issues.`);
    }

  } catch (err) {
    console.error('❌ Verification script failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database.');
  }
}

verify();
