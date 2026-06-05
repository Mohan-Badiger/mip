import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  metalPurityLocked: { type: String, required: true },
  metalWeightLocked: { type: Number, required: true },
  goldRateLocked: { type: Number, required: true },
  makingChargesLocked: { type: Number, required: true },
  gemstonesValueLocked: { type: Number, default: 0 },
  finalPriceLocked: { type: Number, required: true },
  image: { type: String },
  slug: { type: String }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [OrderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    area: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true }
  },
  subTotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true }, // GST
  grandTotal: { type: Number, required: true },
  
  paymentStatus: { type: String, enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cod', 'card'], default: 'card' },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  
  orderStatus: { type: String, enum: ['received', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'received', index: true },
  trackingId: { type: String }
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
