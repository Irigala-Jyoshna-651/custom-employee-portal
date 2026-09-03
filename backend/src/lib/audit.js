const prisma = require('./prisma');

async function log(action, entity, entityId, performedById = null, meta = {}) {
  try {
    await prisma.auditLog.create({ data: { action, entity, entityId: String(entityId || ''), performedById, meta } });
  } catch (err) {
    // swallow to avoid breaking main flow
    console.error('Audit log failed', err);
  }
}

module.exports = { log };
