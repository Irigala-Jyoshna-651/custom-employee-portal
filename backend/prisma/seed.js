const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Roles
  const roleNames = ['Admin','HR','Sales','Support','Finance'];
  const roles = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // Permissions
  const permissionNames = [
    'users.read','users.create','users.update','users.delete',
    'roles.read','roles.create','roles.update','roles.delete',
    'permissions.read','permissions.assign','audit.read',
    'zoho.people.access','zoho.crm.access','zoho.desk.access','zoho.books.access'
  ];
  const permissions = {};
  for (const name of permissionNames) {
    permissions[name] = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // Assign some permissions to roles (example: Admin gets everything)
  for (const perm of Object.values(permissions)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles['Admin'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles['Admin'].id, permissionId: perm.id }
    });
  }

  // Assign sensible defaults for other roles (demo)
  const roleDefaults = {
    HR: ['zoho.people.access'],
    Sales: ['zoho.crm.access'],
    Support: ['zoho.desk.access'],
    Finance: ['zoho.books.access']
  };

  for (const [roleName, permsList] of Object.entries(roleDefaults)) {
    for (const pname of permsList) {
      const perm = permissions[pname];
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[roleName].id, permissionId: perm.id } },
        update: {},
        create: { roleId: roles[roleName].id, permissionId: perm.id }
      });
    }
  }

  // Demo users
  const demoUsers = [
    { email: 'admin@example.com', role: 'Admin' },
    { email: 'hr@example.com', role: 'HR' },
    { email: 'sales@example.com', role: 'Sales' },
    { email: 'support@example.com', role: 'Support' },
    { email: 'finance@example.com', role: 'Finance' }
  ];

  for (const userDef of demoUsers) {
    // Use DEMO_PASSWORD from env when available; otherwise generate a random demo password locally.
    const demoPassword = process.env.DEMO_PASSWORD || (() => {
      const p = require('crypto').randomBytes(8).toString('hex');
      console.warn('DEMO_PASSWORD not set; generated local demo password:', p);
      return p;
    })();
    const hashed = await bcrypt.hash(demoPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: userDef.email },
      update: { password: hashed },
      create: { email: userDef.email, password: hashed }
    });

    // assign role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles[userDef.role].id } },
      update: {},
      create: { userId: user.id, roleId: roles[userDef.role].id }
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
