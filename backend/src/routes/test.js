const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/rbac');

const router = express.Router();

router.get('/people', requireAuth, requirePermission('zoho.people.access'), (req, res) => {
  res.json({ ok: true, area: 'people' });
});

router.get('/crm', requireAuth, requirePermission('zoho.crm.access'), (req, res) => {
  res.json({ ok: true, area: 'crm' });
});

router.get('/desk', requireAuth, requirePermission('zoho.desk.access'), (req, res) => {
  res.json({ ok: true, area: 'desk' });
});

router.get('/finance', requireAuth, requirePermission('zoho.books.access'), (req, res) => {
  res.json({ ok: true, area: 'finance' });
});

module.exports = router;
