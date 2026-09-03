const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // audit log: LOGIN_FAILED
      await prisma.auditLog.create({ data: { action: 'LOGIN_FAILED', entity: 'User', entityId: email, meta: { reason: 'unknown_email' } } }).catch(() => {});
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Here assuming 'active' flag - if not present treat as active
    if (user.active === false) {
      await prisma.auditLog.create({ data: { action: 'LOGIN_FAILED', entity: 'User', entityId: user.id, meta: { reason: 'inactive' } } }).catch(() => {});
      return res.status(403).json({ error: 'User inactive' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await prisma.auditLog.create({ data: { action: 'LOGIN_FAILED', entity: 'User', entityId: user.id, meta: { reason: 'invalid_password' } } }).catch(() => {});
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    if (!secret) return res.status(500).json({ error: 'Server misconfigured' });

    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn });

    // audit log success
    await prisma.auditLog.create({ data: { action: 'LOGIN_SUCCESS', entity: 'User', entityId: user.id, meta: { ip: req.ip } } }).catch(() => {});

    res.json({ token, user: { id: user.id, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server misconfigured' });

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
