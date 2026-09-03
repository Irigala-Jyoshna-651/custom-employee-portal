const axios = require('axios');

const base = 'http://localhost:4000';

const users = [
  { email: 'admin@example.com', role: 'Admin', app: 'people' },
  { email: 'hr@example.com', role: 'HR', app: 'people' },
  { email: 'sales@example.com', role: 'Sales', app: 'crm' },
  { email: 'support@example.com', role: 'Support', app: 'desk' },
  { email: 'finance@example.com', role: 'Finance', app: 'finance' }
];

const PASSWORD = process.env.DEMO_PASSWORD;
if (!PASSWORD) {
  console.error('DEMO_PASSWORD environment variable is required to run this test script');
  process.exit(1);
}

async function test() {
  for (const u of users) {
    try {
      const r = await axios.post(base + '/api/auth/login', { email: u.email, password: PASSWORD });
      const token = r.data.token;
      process.stdout.write(`${u.email} login: OK `);

      // auth/me
      const me = await axios.get(base + '/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      process.stdout.write(`me roles: ${me.data.roles.join(', ')} `);

      // test endpoints
      const tests = [
        { path: '/api/test/people', expected: u.role === 'HR' || u.role === 'Admin' },
        { path: '/api/test/crm', expected: u.role === 'Sales' || u.role === 'Admin' },
        { path: '/api/test/desk', expected: u.role === 'Support' || u.role === 'Admin' },
        { path: '/api/test/finance', expected: u.role === 'Finance' || u.role === 'Admin' }
      ];

      for (const t of tests) {
        try {
          const res = await axios.get(base + t.path, { headers: { Authorization: `Bearer ${token}` } });
          process.stdout.write(`${t.path} -> ${res.status} `);
        } catch (err) {
          if (err.response) process.stdout.write(`${t.path} -> ${err.response.status} `);
          else process.stdout.write(`${t.path} -> ERR `);
        }
      }

      // Zoho demo endpoints (map apps)
      const appKey = u.app === 'finance' ? 'books' : u.app; // rename finance->books
      try {
        const zr = await axios.get(base + `/api/zoho/${appKey}/info`, { headers: { Authorization: `Bearer ${token}` } });
        process.stdout.write(`/api/zoho/${appKey}/info -> ${zr.status} `);
      } catch (err) {
        if (err.response) process.stdout.write(`/api/zoho/${appKey}/info -> ${err.response.status} `);
        else process.stdout.write(`/api/zoho/${appKey}/info -> ERR `);
      }

      console.log('');
    } catch (e) {
      if (e.response) console.log(`${u.email} login failed: ${e.response.status}`);
      else console.log(`${u.email} login error: ${e.message}`);
    }
  }
}

test();
