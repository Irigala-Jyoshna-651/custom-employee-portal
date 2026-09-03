# Custom Employee Portal

Phase 1 and Phase 2 foundation for the Custom Employee Portal with Zoho One integration.

Tech stack
- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: React (Vite)

Backend setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

- Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` to point to your PostgreSQL database.

3. Generate Prisma client

```bash
npx prisma generate
```

4. Apply migrations (creates tables)

If you have a local PostgreSQL instance and `DATABASE_URL` is set in `backend/.env`, run:

```bash
npx prisma migrate dev --name init
```

5. Seed demo data

```bash
npm run seed
```

6. Start backend

```bash
npm start
```

Frontend setup

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

Notes
- The repository includes a Prisma schema at `backend/prisma/schema.prisma` and an initial SQL migration at `backend/prisma/migrations/0001_init/migration.sql`.
- The seed script is `backend/prisma/seed.js` and creates roles, permissions, and demo users with bcrypt-hashed passwords. Default demo password for seeded users is `Password123!` (hashed in DB).

Login API

POST /api/auth/login
- Request JSON: `{ "email": "admin@example.com", "password": "Password123!" }`
- Response: `{ "token": "...", "user": { "id": "...", "email": "..." } }`

GET /api/auth/me
- Header: `Authorization: Bearer <token>`
- Response: `{ "id": "..", "email": ".." }`

RBAC / Permissions

This project implements backend role-based access control (RBAC) using the database models (`Role`, `Permission`, `UserRole`, `RolePermission`).

Middleware
- `requireAuth`: verifies JWT and loads user's roles and permissions from the DB
- `requireRole(roleName)`: requires a specific role (Admin bypasses)
- `requirePermission(permissionName)`: requires a specific permission (Admin bypasses)

Test endpoints
- `GET /api/test/people` — requires `zoho.people.access`
- `GET /api/test/crm` — requires `zoho.crm.access`
- `GET /api/test/desk` — requires `zoho.desk.access`
- `GET /api/test/finance` — requires `zoho.books.access`

Unauthorized access attempts are recorded in the audit logs with action `AUTHZ_FAILED`.
- Do not run migrations or seed scripts on production without reviewing them.

## Security & Final Notes

- Passwords are hashed with bcrypt and plaintext passwords are never stored.
- `JWT_SECRET`, Zoho client secret, and refresh tokens must be set in `backend/.env` and must never be committed to the repository.
- `backend/.env.example` contains placeholder values — copy to `backend/.env` and populate real secrets.
- CORS is restricted to `FRONTEND_URL` set in `backend/.env`.
- Helmet is enabled to set secure HTTP headers.
- Rate limiting is applied to reduce brute-force attempts.
- Zoho integration supports a safe demo mode via `ZOHO_DEMO_MODE=true`.

## Final checklist before demo

1. Ensure `backend/.env` has `DATABASE_URL`, `JWT_SECRET`, and (optional) Zoho env vars.
2. Run migrations and seed: `npx prisma migrate dev --name init && npm run seed`.
3. Start backend and frontend and follow the demo guide in `DEMO_GUIDE.md`.
