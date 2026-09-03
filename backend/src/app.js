const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const adminUsers = require('./routes/admin/users');
const adminRoles = require('./routes/admin/roles');
const adminPermissions = require('./routes/admin/permissions');
const adminAudit = require('./routes/admin/audit');
const zohoRoutes = require('./routes/zoho');

const app = express();

app.use(cors());
app.use(express.json());

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
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
