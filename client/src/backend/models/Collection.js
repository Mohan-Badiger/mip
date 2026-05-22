import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  bannerImage: { type: String }
}, { timestamps: true });

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
