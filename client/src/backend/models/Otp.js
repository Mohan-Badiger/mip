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

// Compound index for querying active OTP records by email and type
OtpSchema.index({ email: 1, type: 1, expiresAt: 1 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
