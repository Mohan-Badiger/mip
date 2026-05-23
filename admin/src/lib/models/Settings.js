import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  autoUpdateRates: { type: Boolean, default: false },
  showLiveBanner: { type: Boolean, default: false },
  autoRecalculatePricing: { type: Boolean, default: true },
  goldRateOffset: { type: Number, default: 0 }, // optional offset value to add/subtract
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
