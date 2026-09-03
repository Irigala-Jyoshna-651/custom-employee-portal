const express = require('express');
const prisma = require('../../lib/prisma');
const { requireAuth, requireRole } = require('../../middleware/rbac');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('Admin'));

// GET /api/permissions
router.get('/', async (req, res, next) => {
  try {
    const perms = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
    res.json(perms.map(p => ({ id: p.id, name: p.name })));
  } catch (err) { next(err); }
});

module.exports = router;
