const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

async function run() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
    console.log('USERS:', users.map(u => ({ email: u.email, roles: u.roles.map(r => r.role.name) })));
  } catch (e) {
    console.error('DB error', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
