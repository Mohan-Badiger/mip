import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true } // [longitude, latitude]
});

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  landline: { type: String },
  hours: { type: String, required: true },
  tag: { type: String, enum: ['Flagship Showroom', 'Upcoming Extension', 'Standard Store'], default: 'Standard Store' },
  location: {
    type: PointSchema,
    required: true
  }
}, { timestamps: true });

// Set 2dsphere index for geolocation distance queries
StoreSchema.index({ location: '2dsphere' });

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
