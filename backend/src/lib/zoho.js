const axios = require('axios');

const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL;
const ZOHO_API_DOMAIN = process.env.ZOHO_API_DOMAIN;
const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const DEMO_MODE = String(process.env.ZOHO_DEMO_MODE || 'true').toLowerCase() === 'true';

let cached = { token: null, expiresAt: 0 };

async function fetchAccessToken() {
  if (DEMO_MODE) throw new Error('Demo mode enabled');
  if (!ZOHO_ACCOUNTS_URL || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) throw new Error('Zoho credentials not configured');
  const now = Date.now();
  if (cached.token && cached.expiresAt - 60000 > now) return cached.token; // cached and not close to expiry

  const url = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('refresh_token', REFRESH_TOKEN);

  const res = await axios.post(url, params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const data = res.data;
  if (!data || !data.access_token) throw new Error('Failed to obtain Zoho access token');
  cached.token = data.access_token;
  cached.expiresAt = Date.now() + (parseInt(data.expires_in || '3600') * 1000);
  return cached.token;
}

async function callZoho(path, method = 'GET') {
  if (DEMO_MODE) throw new Error('Demo mode');
  const token = await fetchAccessToken();
  const url = `${ZOHO_API_DOMAIN}${path}`;
  const res = await axios({ url, method, headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

module.exports = { DEMO_MODE, fetchAccessToken, callZoho };
