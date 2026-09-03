# Demo Guide (3-5 minutes)

1. Start backend:

```bash
cd backend
npm install
cp .env.example .env
# set DATABASE_URL and JWT_SECRET in backend/.env if testing DB features
npm start
```

2. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Login as Admin
- Email: `admin@example.com`
- Password: `Password123!`

4. Show Admin dashboard `/admin`
5. Show `Users`, `Roles`, `Permissions`, `Audit Logs`
6. Logout
7. Login as HR (`hr@example.com`) and show only Zoho People via `Dashboard` → Open
8. Login as Sales (`sales@example.com`) and show only Zoho CRM
9. Login as Support (`support@example.com`) and show only Zoho Desk
10. Login as Finance (`finance@example.com`) and show only Zoho Books

Notes:
- By default demo mode is enabled (`ZOHO_DEMO_MODE=true`) and Zoho endpoints return demo responses.
- To enable real Zoho integration, set Zoho env vars in `backend/.env` and set `ZOHO_DEMO_MODE=false`.
