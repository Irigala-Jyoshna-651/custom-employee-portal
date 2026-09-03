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
- Do not run migrations or seed scripts on production without reviewing them.
