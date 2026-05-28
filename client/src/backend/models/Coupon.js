import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'flat', 'free-making'], required: true },
  discountValue: { type: Number, required: true, default: 0 },
  minCartValue: { type: Number, default: 0 },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, required: true },
  usageCount: { type: Number, default: 0 },
  firstTimeOnly: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
