const express = require('express');
const prisma = require('../../lib/prisma');
const { requireAuth, requireRole } = require('../../middleware/rbac');
const audit = require('../../lib/audit');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('Admin'));

// GET /api/roles
router.get('/', async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: 'asc' } });
    res.json(roles.map(r => ({ id: r.id, name: r.name, permissions: r.permissions.map(p => p.permission.name) })));
  } catch (err) { next(err); }
});

// POST /api/roles
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) return res.status(409).json({ error: 'Role exists' });
    const role = await prisma.role.create({ data: { name } });
    await audit.log('ROLE_CREATED', 'Role', role.id, req.user.id, { name });
    res.status(201).json({ id: role.id, name: role.name });
  } catch (err) { next(err); }
});

// GET /api/roles/:id
router.get('/:id', async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id }, include: { permissions: { include: { permission: true } } } });
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json({ id: role.id, name: role.name, permissions: role.permissions.map(p => p.permission.name) });
  } catch (err) { next(err); }
});

// PUT /api/roles/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing && existing.id !== req.params.id) return res.status(409).json({ error: 'Role name already used' });
    const role = await prisma.role.update({ where: { id: req.params.id }, data: { name } });
    await audit.log('ROLE_UPDATED', 'Role', role.id, req.user.id, { name });
    res.json({ id: role.id, name: role.name });
  } catch (err) { next(err); }
});

// DELETE /api/roles/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const count = await prisma.userRole.count({ where: { roleId: req.params.id } });
    if (count > 0) return res.status(400).json({ error: 'Role assigned to users' });
    await prisma.role.delete({ where: { id: req.params.id } });
    await audit.log('ROLE_DELETED', 'Role', req.params.id, req.user.id, {});
    res.status(204).send();
  } catch (err) { next(err); }
});

// GET /api/roles/:id/permissions
router.get('/:id/permissions', async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id }, include: { permissions: { include: { permission: true } } } });
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json(role.permissions.map(p => p.permission.name));
  } catch (err) { next(err); }
});

// PUT /api/roles/:id/permissions
router.put('/:id/permissions', async (req, res, next) => {
  try {
    const { permissionIds } = req.body || {};
    if (!Array.isArray(permissionIds)) return res.status(400).json({ error: 'permissionIds array required' });
    const permissions = await prisma.permission.findMany({ where: { id: { in: permissionIds } } });
    if (permissions.length !== permissionIds.length) return res.status(400).json({ error: 'One or more permissionIds invalid' });

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: req.params.id } });
      for (const p of permissions) {
        await tx.rolePermission.create({ data: { roleId: req.params.id, permissionId: p.id } });
      }
    });

    await audit.log('PERMISSIONS_UPDATED', 'RolePermission', req.params.id, req.user.id, { permissionIds });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
