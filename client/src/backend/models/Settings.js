import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  autoUpdateRates: { type: Boolean, default: false },
  showLiveBanner: { type: Boolean, default: false },
  autoRecalculatePricing: { type: Boolean, default: true },
  goldRateOffset: { type: Number, default: 0 },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },

  // Store General Profile
  brandName: { type: String, default: 'MIP Jewellers' },
  supportPhone: { type: String, default: '+91 9845012345' },
  supportEmail: { type: String, default: 'support@mipjewellers.com' },
  storeAddress: { type: String, default: '123 Heritage Boulevard, MG Road, Bengaluru, Karnataka - 560001' },

  // Custom Banner / Announcement Bar
  bannerEnabled: { type: Boolean, default: false },
  bannerText: { type: String, default: '✨ Grand Festive Sale: Flat 5% Off Making Charges on Diamond & Gold Jewelry! ✨' },
  bannerBgColor: { type: String, default: '#B45309' },
  bannerTextColor: { type: String, default: '#FFFFFF' },

  // Financial & Taxes
  gstRate: { type: Number, default: 3.0 },
  makingChargeGstRate: { type: Number, default: 18.0 },

  // Shipping & Insurance
  freeShippingThreshold: { type: Number, default: 50000 },
  shippingCharge: { type: Number, default: 250 },
  insuranceFee: { type: Number, default: 150 },

  // Cash on Delivery (COD) Rules
  codAllowed: { type: Boolean, default: true },
  codLimit: { type: Number, default: 20000 },
  codExtraCharge: { type: Number, default: 100 },

  // Returns Policy
  allowReturns: { type: Boolean, default: true },
  returnPeriodDays: { type: Number, default: 7 },
  // Enforce singleton pattern at the database level
  isSingleton: { type: Boolean, default: true, unique: true, enum: [true] }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
