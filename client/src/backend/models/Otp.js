import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['register', 'login', 'reset'], required: true },
  payload: { type: mongoose.Schema.Types.Mixed }, // Store register data like name, phone, password
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
