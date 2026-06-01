import mongoose from 'mongoose';

const PurchasePlanEnrolmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planName: { type: String, required: true }, // 'Kanaka Plus' or 'Shreyas'
  amount: { type: Number, required: true },
  tenure: { type: String, required: true },
  panCard: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'Net Banking' }
}, { timestamps: true });

export default mongoose.models.PurchasePlanEnrolment || mongoose.model('PurchasePlanEnrolment', PurchasePlanEnrolmentSchema);
