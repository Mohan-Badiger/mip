import mongoose from 'mongoose';

const GemstoneSchema = new mongoose.Schema({
  type: { type: String, enum: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'], required: true },
  carat: { type: Number, required: true },
  clarity: { type: String, enum: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'] },
  color: { type: String, enum: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'Fancy'] },
  cut: { type: String, enum: ['excellent', 'very_good', 'good', 'fair'] },
  value: { type: Number, required: true }
});

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }], // Cloudinary image URL strings
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  collectionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', index: true },
  
  metalType: { type: String, enum: ['gold', 'silver', 'platinum'], required: true },
  metalPurity: { type: String, enum: ['18KT', '22KT', '24KT', '950PT'], required: true },
  metalWeight: { type: Number, required: true }, // In grams
  makingChargeType: { type: String, enum: ['percentage', 'flat_per_gram', 'flat_total'], required: true },
  makingChargeValue: { type: Number, required: true },
  
  gemstones: [GemstoneSchema],
  
  stock: { type: Number, required: true, default: 1 },
  tag: { type: String, trim: true }, // e.g. 'New Arrival', 'Bestseller', 'Limited Edition'
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

// Text indexing for fast fuzzy searching in queries
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
