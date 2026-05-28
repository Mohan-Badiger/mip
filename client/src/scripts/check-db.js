const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to configure custom DNS servers in Node.js:', e.message);
}

// Read env variables manually
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent += fs.readFileSync(envLocalPath, 'utf8') + '\n';
}
if (fs.existsSync(envPath)) {
  envContent += fs.readFileSync(envPath, 'utf8') + '\n';
}

let mongodbUri = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('MONGODB_URI=')) {
    mongodbUri = line.split('MONGODB_URI=')[1].trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!mongodbUri) {
  mongodbUri = 'mongodb://localhost:27017/mip_jewellers';
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  phone: String,
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: String,
  orderStatus: String,
  grandTotal: Number,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully.');

    const users = await User.find({});
    console.log(`Total users in DB: ${users.length}`);
    users.forEach(u => {
      console.log(`- User ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
    });

    const orders = await Order.find({});
    console.log(`Total orders in DB: ${orders.length}`);
    orders.forEach(o => {
      console.log(`- Order ID: ${o._id}, User: ${o.user}, Status: ${o.orderStatus}, Total: ${o.grandTotal}`);
    });

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

run();
