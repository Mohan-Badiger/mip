import dbConnect from './dbConnect';
import AuditLog from './models/AuditLog';

export async function logAdminAction(req, { action, entity, entityId, description, changes }) {
  try {
    await dbConnect();
    
    let ipAddress = '127.0.0.1';
    if (req && typeof req.headers?.get === 'function') {
      ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    }

    const log = await AuditLog.create({
      action,
      entity,
      entityId: String(entityId),
      description,
      adminEmail: 'super.admin@mip.com', // default admin account
      changes,
      ipAddress
    });
    
    console.log(`[AUDIT LOG] ${action} on ${entity} (${entityId}) by super.admin@mip.com: ${description}`);
    return log;
  } catch (error) {
    console.error('Failed to create administrative audit log:', error);
  }
}
