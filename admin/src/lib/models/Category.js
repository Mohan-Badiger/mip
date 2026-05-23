import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
