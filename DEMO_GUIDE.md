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

## Zoho integration and architecture (demo)

- This project integrates with Zoho services (People, CRM, Desk, Books) through a backend proxy. In production you must register an OAuth app or use a Zoho service-account/console method. The backend includes a `backend/src/lib/zoho.js` helper that handles token caching and refresh.
- For local demos we use `ZOHO_DEMO_MODE=true` to avoid needing Zoho credentials. When demo mode is disabled, provide the following env vars in `backend/.env` (do NOT commit them):
	- `ZOHO_CLIENT_ID` — your Zoho OAuth client id
	- `ZOHO_CLIENT_SECRET` — your Zoho client secret
	- `ZOHO_REFRESH_TOKEN` — refresh token for server-side access

## Demo flow checklist (3-5 minutes)

1. Start backend and frontend (see Setup above).
2. Admin login: use `admin@example.com` / `Password123!`.
3. Open `/admin` — show Users, Roles, Permissions.
4. Open Audit Logs (`/admin/audit-logs`) and show recent entries (login, authz failures, Zoho demo accesses).
5. Logout.
6. HR login: `hr@example.com` / `Password123!` — show Dashboard → Open Zoho People (demo response).
7. Sales login: `sales@example.com` / `Password123!` — show Dashboard → Open Zoho CRM (demo response).
8. Support login: `support@example.com` / `Password123!` — show Dashboard → Open Zoho Desk (demo response).
9. Finance login: `finance@example.com` / `Password123!` — show Dashboard → Open Zoho Books (demo response).
10. Demonstrate backend RBAC enforcement by attempting an unauthorized API call (e.g., HR calling `/api/test/crm` should return 403). Use browser devtools or server logs to show enforcement.

## Demo credentials (local only)

- Admin: `admin@example.com` / `Password123!`
- HR: `hr@example.com` / `Password123!`
- Sales: `sales@example.com` / `Password123!`
- Support: `support@example.com` / `Password123!`
- Finance: `finance@example.com` / `Password123!`

> Never store or commit DB/JWT/Zoho secrets in the repository. Use `backend/.env` locally and keep it out of source control.
