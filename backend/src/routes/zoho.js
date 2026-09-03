const express = require('express');
const APPS = require('../config/zohoApps');
const { requireAuth } = require('../middleware/rbac');
const { DEMO_MODE, callZoho } = require('../lib/zoho');
const prisma = require('../lib/prisma');
const audit = require('../lib/audit');

const router = express.Router();

// GET /api/zoho/:app/info
router.get('/:app/info', requireAuth, async (req, res, next) => {
  try {
    const appKey = req.params.app;
    const app = APPS[appKey];
    if (!app) return res.status(404).json({ error: 'Unknown app' });

    // check permission
    if (!req.user || (!req.user.permissions || !req.user.permissions.includes(app.permission)) && !(req.user.roles && req.user.roles.includes('Admin'))) {
      await audit.log('AUTHZ_FAILED', 'Zoho', appKey, req.user && req.user.id, { path: req.path });
      return res.status(403).json({ error: 'Forbidden' });
    }

    const endpoint = app.endpoints.info;
    if (!endpoint) return res.status(400).json({ error: 'No endpoint configured' });

    if (DEMO_MODE) {
      const demo = { demo: true, app: app.name, message: 'Demo mode enabled - no Zoho call made' };
      await audit.log('ZOHO_ACCESS_DEMO', 'Zoho', appKey, req.user && req.user.id, { demo: true });
      return res.json(demo);
    }

    try {
      const data = await callZoho(endpoint.path, endpoint.method);
      await audit.log('ZOHO_ACCESS_SUCCESS', 'Zoho', appKey, req.user && req.user.id, { path: endpoint.path });
      res.json({ data });
    } catch (err) {
      await audit.log('ZOHO_ACCESS_FAILED', 'Zoho', appKey, req.user && req.user.id, { error: String(err.message) });
      return res.status(502).json({ error: 'Zoho API request failed' });
    }
  } catch (err) { next(err); }
});

module.exports = router;
