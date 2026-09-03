const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const adminUsers = require('./routes/admin/users');
const adminRoles = require('./routes/admin/roles');
const adminPermissions = require('./routes/admin/permissions');
const adminAudit = require('./routes/admin/audit');
const zohoRoutes = require('./routes/zoho');

const app = express();

// Security headers
app.use(helmet());

// Rate limiting (general)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

// CORS - restrict to configured frontend URL when provided
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/users', adminUsers);
app.use('/api/roles', adminRoles);
app.use('/api/permissions', adminPermissions);
app.use('/api/audit-logs', adminAudit);
app.use('/api/zoho', zohoRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  // Avoid leaking sensitive info in error responses or logs
  if (process.env.NODE_ENV === 'production') {
    console.error('Internal server error');
  } else {
    console.error(err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
