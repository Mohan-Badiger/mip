import mongoose from 'mongoose';

const GoldRateSchema = new mongoose.Schema({
  metal: { type: String, enum: ['gold', 'silver', 'platinum'], required: true },
  purity: { type: String, enum: ['18KT', '22KT', '24KT', '950PT'], required: true },
  pricePerGram: { type: Number, required: true },
  currency: { type: String, default: 'INR' }
}, { timestamps: true });

GoldRateSchema.index({ metal: 1, purity: 1 }, { unique: true });

export default mongoose.models.GoldRate || mongoose.model('GoldRate', GoldRateSchema);
