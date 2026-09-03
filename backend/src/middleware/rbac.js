const prisma = require('../lib/prisma');
const { authenticate } = require('./auth');

async function loadUserRolesAndPermissions(userId) {
  // Load roles and permissions for user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
    }
  });

  if (!user) return { roles: [], permissions: [] };

  const roles = user.roles.map(ur => ur.role.name);

  // collect permissions
  const perms = new Set();
  for (const ur of user.roles) {
    const role = ur.role;
    if (role && role.permissions) {
      for (const rp of role.permissions) {
        if (rp.permission && rp.permission.name) perms.add(rp.permission.name);
      }
    }
  }

  return { roles, permissions: Array.from(perms) };
}

// requireAuth runs JWT authenticate and loads roles+permissions
async function requireAuth(req, res, next) {
  try {
    await authenticate(req, res, async (err) => {
      if (err) return next(err);
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
      const { roles, permissions } = await loadUserRolesAndPermissions(req.user.id);
      req.user.roles = roles;
      req.user.permissions = permissions;
      next();
    });
  } catch (err) {
    next(err);
  }
}

function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.roles && req.user.roles.includes('Admin')) return next();
    if (req.user.roles && req.user.roles.includes(roleName)) return next();
    // audit
    prisma.auditLog.create({ data: { action: 'AUTHZ_FAILED', entity: 'Role', entityId: req.user.id, meta: { requiredRole: roleName, path: req.path } } }).catch(() => {});
    return res.status(403).json({ error: 'Forbidden' });
  };
}

function requirePermission(permissionName) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.roles && req.user.roles.includes('Admin')) return next();
    if (req.user.permissions && req.user.permissions.includes(permissionName)) return next();
    // audit
    prisma.auditLog.create({ data: { action: 'AUTHZ_FAILED', entity: 'Permission', entityId: req.user.id, meta: { requiredPermission: permissionName, path: req.path } } }).catch(() => {});
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { requireAuth, requireRole, requirePermission };
