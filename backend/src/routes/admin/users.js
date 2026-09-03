const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { requireAuth, requireRole } = require('../../middleware/rbac');
const audit = require('../../lib/audit');

const router = express.Router();

// All admin user routes require Admin role
router.use(requireAuth);
router.use(requireRole('Admin'));

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const out = users.map(u => ({ id: u.id, email: u.email, active: u.active, createdAt: u.createdAt, roles: u.roles.map(r => r.role.name) }));
    res.json(out);
  } catch (err) { next(err); }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const { email, password, roleIds } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed } });

    // assign roles if provided (validate ids)
    if (Array.isArray(roleIds) && roleIds.length) {
      const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
      for (const r of roles) {
        await prisma.userRole.create({ data: { userId: user.id, roleId: r.id } }).catch(() => {});
        await audit.log('ROLE_ASSIGNED', 'UserRole', user.id, req.user.id, { roleId: r.id });
      }
    }

    await audit.log('USER_CREATED', 'User', user.id, req.user.id, { email: user.email });
    res.status(201).json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (err) { next(err); }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { roles: { include: { role: true } } } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ id: user.id, email: user.email, active: user.active, createdAt: user.createdAt, roles: user.roles.map(r => r.role.name) });
  } catch (err) { next(err); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });

    const data = {};
    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(409).json({ error: 'Email already exists' });
      data.email = email;
    }
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    await audit.log('USER_UPDATED', 'User', updated.id, req.user.id, { email: updated.email });
    res.json({ id: updated.id, email: updated.email, active: updated.active, updatedAt: updated.updatedAt });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    await prisma.user.delete({ where: { id: req.params.id } });
    await audit.log('USER_DELETED', 'User', req.params.id, req.user.id, { email: user.email });
    res.status(204).send();
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') return res.status(400).json({ error: 'active boolean required' });
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { active } });
    await audit.log('USER_STATUS_CHANGED', 'User', user.id, req.user.id, { active });
    res.json({ id: user.id, active: user.active });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/roles
router.patch('/:id/roles', async (req, res, next) => {
  try {
    const { roleIds } = req.body || {};
    if (!Array.isArray(roleIds)) return res.status(400).json({ error: 'roleIds array required' });

    // validate roles exist
    const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
    if (roles.length !== roleIds.length) return res.status(400).json({ error: 'One or more roleIds invalid' });

    // remove existing roles and set new ones in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: req.params.id } });
      for (const r of roles) {
        await tx.userRole.create({ data: { userId: req.params.id, roleId: r.id } });
        await audit.log('ROLE_ASSIGNED', 'UserRole', req.params.id, req.user.id, { roleId: r.id });
      }
    });

    await audit.log('USER_UPDATED', 'User', req.params.id, req.user.id, { roles: roleIds });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
