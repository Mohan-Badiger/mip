import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true, index: true },
  entity: { type: String, required: true, index: true }, // e.g. 'Product', 'GoldRate', 'Order', 'Collection'
  entityId: { type: String, required: true, index: true },
  description: { type: String, required: true },
  adminEmail: { type: String, default: 'super.admin@mip.com', index: true },
  changes: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String }
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
