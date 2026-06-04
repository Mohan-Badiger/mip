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
  type: { type: String, enum: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'], required: true },
  carat: { type: Number, required: true },
  value: { type: Number, required: true }
});

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  metalType: { type: String, required: true },
  metalPurity: { type: String, required: true },
  metalWeight: { type: Number, required: true },
  makingChargeType: { type: String, default: 'flat_total' },
  makingChargeValue: { type: Number, default: 0 },
  gemstones: [GemstoneSchema],
  stock: { type: Number, required: true, default: 5 },
  tag: { type: String },
  certification: { type: String },
  isActive: { type: Boolean, default: true },
  gender: { type: String, default: 'Women' }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Category definitions
const seedCategories = [
  { slug: 'earrings', name: 'Earrings', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594799/mip_jewellers/premium/f5ffadsapwwiyjv2opdx.jpg', description: 'Elegant drops to stunning jhumkas' },
  { slug: 'bangles', name: 'Bangles', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594801/mip_jewellers/premium/m62lixzly2olf5lvmvis.jpg', description: 'Traditional kadas to modern stacks' },
  { slug: 'chains', name: 'Chains', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594803/mip_jewellers/premium/smamryqbfmzh0zchgnpz.jpg', description: 'Delicate to bold gold chains' },
  { slug: 'rings', name: 'Rings', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594804/mip_jewellers/premium/sugbfup0cpqbmw22h9nw.jpg', description: 'Solitaires, eternity bands & more' },
  { slug: 'coins-bars', name: 'Coins & Bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594806/mip_jewellers/premium/sxcv8eebqnbfs3lwpogq.jpg', description: 'BIS Hallmarked 22KT & 24KT gold' },
  { slug: 'necklaces', name: 'Necklaces', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594808/mip_jewellers/premium/sr346hvhhh015hgzhxqs.jpg', description: 'Temple sets to contemporary pendants' }
];

// Product definitions
const seedProducts = [
  // Earrings
  { slug: 'lotus-diamond-drops', name: 'Lotus Diamond Drops', category: 'earrings', price: 28500, weight: 3.2, metal: '18KT Gold', stone: 'Diamond', tag: 'New', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595267/mip_jewellers/unique/jeu7lmdxmzcyi58iw6qk.jpg' },
  { slug: 'classic-jhumka', name: 'Classic Jhumka', category: 'earrings', price: 18900, weight: 5.1, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595269/mip_jewellers/unique/rfzeuingral4mxus6vak.jpg' },
  { slug: 'pearl-drop-studs', name: 'Pearl Drop Studs', category: 'earrings', price: 12400, weight: 2.8, metal: '18KT Gold', stone: 'Pearl', tag: 'Bestseller', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595271/mip_jewellers/unique/cz52o21im0blbhfmliap.jpg' },
  { slug: 'heritage-chandbali', name: 'Heritage Chandbali', category: 'earrings', price: 34200, weight: 7.6, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595272/mip_jewellers/unique/ec7c0bu6yxz7mc5pi95p.jpg' },
  { slug: 'floral-studs', name: 'Floral Diamond Studs', category: 'earrings', price: 22100, weight: 2.1, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Kids', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595274/mip_jewellers/unique/f0qz7ydgzkfqnocycstk.jpg' },
  { slug: 'temple-jhumka', name: 'Temple Jhumka', category: 'earrings', price: 26700, weight: 6.3, metal: '22KT Gold', stone: null, tag: 'New', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595276/mip_jewellers/unique/ircj1k2mfubalywgwbmq.jpg' },

  // Bangles
  { slug: 'classic-gold-bangle', name: 'Classic Plain Bangle Set', category: 'bangles', price: 42000, weight: 14.2, metal: '22KT Gold', stone: null, tag: 'Bestseller', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595277/mip_jewellers/unique/eqqntvshch19zgboawcm.jpg' },
  { slug: 'diamond-bangle', name: 'Diamond Bangle', category: 'bangles', price: 68500, weight: 9.8, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595279/mip_jewellers/unique/ly0onmtfsapvou52rbit.jpg' },
  { slug: 'temple-kada', name: 'Temple Kada', category: 'bangles', price: 55200, weight: 18.4, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595280/mip_jewellers/unique/duipegxqocpzzslnzuhz.jpg' },
  { slug: 'floral-bangle-pair', name: 'Floral Bangle Pair', category: 'bangles', price: 38900, weight: 12.1, metal: '22KT Gold', stone: null, tag: 'New', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595282/mip_jewellers/unique/bnqgcsbokbkfkfebkrut.jpg' },
  { slug: 'ruby-bangle', name: 'Ruby Studded Bangle', category: 'bangles', price: 49800, weight: 11.6, metal: '22KT Gold', stone: 'Ruby', tag: null, gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595284/mip_jewellers/unique/qumcee6ejues8wpatljv.jpg' },
  { slug: 'antique-bangle', name: 'Antique Finish Bangle', category: 'bangles', price: 33600, weight: 10.4, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600' },

  // Chains
  { slug: 'singapore-chain', name: 'Singapore Chain', category: 'chains', price: 24300, weight: 5.4, metal: '22KT Gold', stone: null, tag: 'Bestseller', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594803/mip_jewellers/premium/smamryqbfmzh0zchgnpz.jpg' },
  { slug: 'box-chain', name: 'Box Chain', category: 'chains', price: 19800, weight: 4.2, metal: '22KT Gold', stone: null, tag: null, gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600' },
  { slug: 'figaro-chain', name: 'Figaro Chain', category: 'chains', price: 31400, weight: 7.8, metal: '22KT Gold', stone: null, tag: null, gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600' },
  { slug: 'rope-chain', name: 'Rope Chain', category: 'chains', price: 27600, weight: 6.5, metal: '22KT Gold', stone: null, tag: 'New', gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600' },
  { slug: 'diamond-chain', name: 'Diamond Station Chain', category: 'chains', price: 45200, weight: 5.1, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600' },
  { slug: 'cable-chain', name: 'Cable Chain', category: 'chains', price: 16900, weight: 3.8, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600' },

  // Rings
  { slug: 'solitaire-diamond-ring', name: 'Solitaire Diamond Ring', category: 'rings', price: 52000, weight: 3.4, metal: '18KT Gold', stone: 'Diamond', tag: 'Bestseller', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594804/mip_jewellers/premium/sugbfup0cpqbmw22h9nw.jpg' },
  { slug: 'cluster-ring', name: 'Diamond Cluster Ring', category: 'rings', price: 38700, weight: 4.2, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600' },
  { slug: 'plain-gold-ring', name: 'Plain Band Ring', category: 'rings', price: 14200, weight: 3.8, metal: '22KT Gold', stone: null, tag: null, gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600' },
  { slug: 'ruby-ring', name: 'Ruby Halo Ring', category: 'rings', price: 29500, weight: 3.6, metal: '18KT Gold', stone: 'Ruby', tag: 'New', gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600' },
  { slug: 'eternity-band', name: 'Diamond Eternity Band', category: 'rings', price: 64800, weight: 3.2, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=600' },
  { slug: 'temple-ring', name: 'Temple Ring', category: 'rings', price: 18400, weight: 4.8, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=600' },

  // Coins & Bars
  { slug: 'lakshmi-coin-1g', name: 'Lakshmi Gold Coin 1g', category: 'coins-bars', price: 7500, weight: 1.0, metal: '24KT Gold', stone: null, tag: null, gender: 'Kids', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594806/mip_jewellers/premium/sxcv8eebqnbfs3lwpogq.jpg' },
  { slug: 'lakshmi-coin-5g', name: 'Lakshmi Gold Coin 5g', category: 'coins-bars', price: 37200, weight: 5.0, metal: '24KT Gold', stone: null, tag: 'Bestseller', gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=600' },
  { slug: 'gold-bar-10g', name: 'MIP Gold Bar 10g', category: 'coins-bars', price: 72800, weight: 10.0, metal: '24KT Gold', stone: null, tag: null, gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600' },
  { slug: 'gold-bar-20g', name: 'MIP Gold Bar 20g', category: 'coins-bars', price: 144600, weight: 20.0, metal: '24KT Gold', stone: null, tag: null, gender: 'Men', unsplashUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600' },
  { slug: 'ganesh-coin-2g', name: 'Ganesh Gold Coin 2g', category: 'coins-bars', price: 14800, weight: 2.0, metal: '24KT Gold', stone: null, tag: 'New', gender: 'Kids', unsplashUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=600' },
  { slug: 'gold-coin-8g', name: 'Round Gold Coin 8g', category: 'coins-bars', price: 58200, weight: 8.0, metal: '24KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=600' },

  // Necklaces
  { slug: 'temple-necklace', name: 'Temple Gold Necklace', category: 'necklaces', price: 124000, weight: 32.4, metal: '22KT Gold', stone: null, tag: 'Bestseller', gender: 'Women', cloudinaryUrl: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594808/mip_jewellers/premium/sr346hvhhh015hgzhxqs.jpg' },
  { slug: 'diamond-pendant-set', name: 'Diamond Pendant Necklace', category: 'necklaces', price: 86500, weight: 8.2, metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600' },
  { slug: 'ruby-choker', name: 'Ruby Gold Choker', category: 'necklaces', price: 98200, weight: 24.6, metal: '22KT Gold', stone: 'Ruby', tag: 'New', gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600' },
  { slug: 'long-gold-chain', name: 'Opera Length Gold Chain', category: 'necklaces', price: 54300, weight: 18.8, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600' },
  { slug: 'antique-haram', name: 'Antique Gold Haram', category: 'necklaces', price: 188000, weight: 52.4, metal: '22KT Gold', stone: null, tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600' },
  { slug: 'pearl-necklace', name: 'Pearl & Gold Necklace', category: 'necklaces', price: 44800, weight: 12.1, metal: '18KT Gold', stone: 'Pearl', tag: null, gender: 'Women', unsplashUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600' }
];

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongodbUri);
    console.log('✅ Connected');

    // 1. Seed Categories first
    const categoryMap = {};
    console.log('📂 Seeding categories...');
    for (const catData of seedCategories) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`✨ Created category: ${catData.name}`);
      } else {
        // update banner images just in case
        cat.image = catData.image;
        cat.description = catData.description;
        cat.name = catData.name;
        await cat.save();
      }
      categoryMap[catData.slug] = cat._id;
    }

    // 2. Upload Unsplash images to Cloudinary or use existing Cloudinary URLs
    console.log('\n📤 Uploading Unsplash images to Cloudinary (this might take a few seconds)...');
    const finalProductUrls = {};

    for (const p of seedProducts) {
      if (p.cloudinaryUrl) {
        finalProductUrls[p.slug] = p.cloudinaryUrl;
        console.log(`✅ Using existing Cloudinary for: ${p.slug} -> ${p.cloudinaryUrl}`);
      } else if (p.unsplashUrl) {
        console.log(`🔄 Uploading Unsplash image to Cloudinary for: ${p.slug}...`);
        const res = await cloudinary.uploader.upload(p.unsplashUrl, {
          folder: 'mip_jewellers/seeded'
        });
        finalProductUrls[p.slug] = res.secure_url;
        console.log(`✅ Uploaded ${p.slug}: ${res.secure_url}`);
      }
    }

    // 3. Clear products and re-seed
    console.log('\n🧹 Clearing products collection...');
    await Product.deleteMany({});
    console.log('✅ Products collection cleared.');

    console.log('\n💎 Seeding 36 products...');
    for (let i = 0; i < seedProducts.length; i++) {
      const pData = seedProducts[i];
      const categoryId = categoryMap[pData.category];

      let metalType = 'gold';
      let metalPurity = '22KT';
      const metalStr = pData.metal.toLowerCase();
      if (metalStr.includes('silver')) {
        metalType = 'silver';
        metalPurity = '950PT';
      } else if (metalStr.includes('platinum')) {
        metalType = 'platinum';
        metalPurity = '950PT';
      } else {
        metalType = 'gold';
        if (metalStr.includes('18kt')) metalPurity = '18KT';
        else if (metalStr.includes('24kt')) metalPurity = '24KT';
        else metalPurity = '22KT';
      }

      const gemstones = [];
      let gemstoneValue = 0;
      if (pData.stone) {
        const type = pData.stone.toLowerCase();
        const value = type === 'diamond' ? 15000 : (type === 'ruby' ? 8000 : (type === 'pearl' ? 4000 : 3000));
        gemstones.push({
          type: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'].includes(type) ? type : 'diamond',
          carat: type === 'diamond' ? 0.25 : 1.0,
          value
        });
        gemstoneValue = value;
      }

      // Calculate making charges to mirror pricingService
      // Gold rate fallback pricing
      let rate = 7200; // 22KT Gold rate fallback
      if (metalType === 'gold') {
        if (metalPurity === '18KT') rate = 6000;
        if (metalPurity === '24KT') rate = 7850;
      } else if (metalType === 'silver') {
        rate = 95;
      } else if (metalType === 'platinum') {
        rate = 3200;
      }

      const rawMetalValue = pData.weight * rate;
      const basePrice = pData.price / 1.03;
      const makingCharges = Math.max(100, basePrice - rawMetalValue - gemstoneValue);

      // Define certifications
      let cert = 'BIS HALLMARK 916';
      if (metalType === 'gold') {
        if (metalPurity === '18KT') cert = 'BIS HALLMARK 750';
        else if (metalPurity === '24KT') cert = 'BIS HALLMARK 999';
      } else if (metalType === 'platinum') {
        cert = '950 PLATINUM PURITY CERTIFIED';
      } else if (metalType === 'silver') {
        cert = '950 SILVER PURITY CERTIFIED';
      }

      if (gemstones.length > 0) {
        const mainGem = gemstones[0].type.toLowerCase();
        if (mainGem === 'diamond') {
          cert = 'GIA / IGI CERTIFIED DIAMOND';
        } else {
          cert = `SGL CERTIFIED ${mainGem.toUpperCase()}`;
        }
      }

      const sku = `MIP-${pData.category.toUpperCase()}-${1000 + i}`;
      const imageCloudUrl = finalProductUrls[pData.slug];

      const newProduct = await Product.create({
        sku,
        name: pData.name,
        slug: pData.slug,
        description: `Luxurious handcrafted ${pData.name} made of premium ${pData.metal}. Perfect for weddings, celebrations, and festive occasions.`,
        images: [imageCloudUrl],
        category: categoryId,
        metalType,
        metalPurity,
        metalWeight: pData.weight,
        makingChargeType: 'flat_total',
        makingChargeValue: Math.round(makingCharges),
        gemstones,
        stock: Math.floor(Math.random() * 16) + 5, // random stock between 5 and 20
        tag: pData.tag,
        certification: cert,
        isActive: true,
        gender: pData.gender || 'Women'
      });

      console.log(`✨ Seeded [${newProduct.sku}] - "${newProduct.name}" | Cert: ${cert} | Stock: ${newProduct.stock}`);
    }

    console.log('\n🎉 Database re-seeding completed perfectly!');
    console.log('\n🔗 COPY-PASTE THE FOLLOWING IMAGE MAP TO products.js MOCK FILE:\n');
    console.log(JSON.stringify(finalProductUrls, null, 2));

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

run();
