const express = require('express');
const prisma = require('../../lib/prisma');
const { requireAuth, requireRole } = require('../../middleware/rbac');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('Admin'));

// GET /api/audit-logs?page=1&size=20
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const size = Math.min(100, Math.max(1, parseInt(req.query.size || '20')));
    const skip = (page - 1) * size;
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: size }),
      prisma.auditLog.count()
    ]);
    res.json({ total, page, size, items });
  } catch (err) { next(err); }
});

module.exports = router;
