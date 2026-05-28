/**
 * Seed script to create the initial Super Admin user.
 * Run once: node scripts/seed-admin.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });
dotenv.config({ path: resolve(__dirname, '..', '.env.local'), override: true });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env or .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'super.admin@mip.com';
const ADMIN_PASSWORD = 'MIP@2025';
const ADMIN_NAME = 'Mohan Badiger';
const ADMIN_PHONE = '+919845012345';

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true, lowercase: true },
      password: String,
      phone: { type: String, unique: true },
      role: { type: String, enum: ['customer', 'sales-rep', 'admin', 'catalog-manager', 'cms-editor'], default: 'customer' },
      status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
      addresses: [{ tag: String, street: String, city: String, state: String, pincode: String, isDefault: Boolean }],
      isEmailVerified: { type: Boolean, default: false },
      refreshToken: String,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists (role: ${existing.role}).`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        existing.status = 'Active';
        await existing.save();
        console.log('🔄 Updated existing user role to "admin".');
      }
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone: ADMIN_PHONE,
      role: 'admin',
      status: 'Active',
      isEmailVerified: true,
    });

    console.log('');
    console.log('✅ Super Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
