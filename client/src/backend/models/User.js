import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  tag: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String, required: true }, // Hashed password
  phone: { type: String, unique: true, index: true, required: true },
  role: { type: String, enum: ['customer', 'sales-rep', 'admin', 'catalog-manager', 'cms-editor'], default: 'customer', index: true },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  addresses: [AddressSchema],
  isEmailVerified: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  refreshToken: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
