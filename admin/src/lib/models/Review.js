import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  product: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
