-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Role" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE "Permission" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE "UserRole" (
  "userId" uuid NOT NULL,
  "roleId" uuid NOT NULL,
  PRIMARY KEY ("userId","roleId"),
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("roleId") REFERENCES "Role"(id) ON DELETE CASCADE
);

CREATE TABLE "RolePermission" (
  "roleId" uuid NOT NULL,
  "permissionId" uuid NOT NULL,
  PRIMARY KEY ("roleId","permissionId"),
  FOREIGN KEY ("roleId") REFERENCES "Role"(id) ON DELETE CASCADE,
  FOREIGN KEY ("permissionId") REFERENCES "Permission"(id) ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL,
  "entityId" text NOT NULL,
  "performedById" uuid NULL,
  meta jsonb NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY ("performedById") REFERENCES "User"(id) ON DELETE SET NULL
);
