# CorreHub MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, mobile-first, multi-tenant CorreHub MVP in Next.js 15 with authentication, groups, events, attendance, QR check-in, rankings, dashboards, partners, feed, SEO, and production-ready architecture.

**Architecture:** Use a modular Next.js monolith with domain-focused `features/*` modules, Prisma for data access, Auth.js for authentication, and server-first rendering patterns. Keep every business entity tenant-scoped, soft-delete aware, policy-protected, and prepared for future monetization, observability, and storage provider swaps.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide React, Motion, React Hook Form, Zod, TanStack Table, Prisma, PostgreSQL, Auth.js, bcryptjs, QR code library, next-sitemap-compatible metadata patterns.

---

## File Structure Map

Expected top-level assets for this phase:

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.env.example`
- Create: `README.md`
- Create: `src/app/**/*`
- Create: `src/components/**/*`
- Create: `src/features/**/*`
- Create: `src/lib/**/*`
- Create: `src/hooks/**/*`
- Create: `src/styles/globals.css`
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `public/**/*`

### Task 1: Scaffold the application foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/env.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create the Next.js package manifest with required dependencies**

```json
{
  "name": "correhub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@auth/prisma-adapter": "latest",
    "@hookform/resolvers": "latest",
    "@prisma/client": "latest",
    "bcryptjs": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "motion": "latest",
    "next": "15.x",
    "next-auth": "latest",
    "qrcode": "latest",
    "react": "19.x",
    "react-dom": "19.x",
    "react-hook-form": "latest",
    "sonner": "latest",
    "tailwind-merge": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@eslint/eslintrc": "latest",
    "@tailwindcss/postcss": "latest",
    "@types/bcryptjs": "latest",
    "@types/node": "latest",
    "@types/qrcode": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "prisma": "latest",
    "tailwindcss": "latest",
    "tsx": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2: Initialize the application shell and core config**

```ts
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CorreHub",
  description: "Plataforma nacional para comunidades de corrida."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Add environment parsing for required runtime variables**

```ts
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: install completes and `node_modules` is created

- [ ] **Step 5: Run lint on the empty scaffold**

Run: `npm run lint`
Expected: passes or reports only files not yet created, which are fixed in subsequent tasks

### Task 2: Model the database and tenant-safe domain entities

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/features/tenants/types.ts`
- Create: `src/features/groups/types.ts`
- Create: `src/features/events/types.ts`
- Create: `src/features/partners/types.ts`
- Create: `src/features/feature-flags/types.ts`

- [ ] **Step 1: Write the Prisma schema with tenant-aware entities and enums**

```prisma
model Tenant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  status    TenantStatus @default(ACTIVE)
  plan      PlanType @default(FREE)
  timezone  String   @default("America/Recife")
  users     User[]
  groups    Group[]
  events    RunEvent[]
  partners  Partner[]
  settings  TenantSettings?
  flags     FeatureFlag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Group {
  id           String   @id @default(cuid())
  tenantId     String
  slug         String
  name         String
  status       ApprovalStatus @default(PENDING)
  deletedAt    DateTime?
  deletedById  String?
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  @@unique([tenantId, slug])
  @@index([tenantId, status, deletedAt])
}
```

- [ ] **Step 2: Extend the schema with auth, attendance, check-in, feed, notifications, settings, and flags**

```prisma
model TenantSettings {
  id                   String   @id @default(cuid())
  tenantId             String   @unique
  cityDisplayName      String
  logoUrl              String?
  primaryColor         String?
  bannerUrl            String?
  whatsapp             String?
  defaultEventRadiusKm Int      @default(5)
  tenant               Tenant   @relation(fields: [tenantId], references: [id])
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model FeatureFlag {
  id          String   @id @default(cuid())
  tenantId    String
  key         String
  enabled     Boolean  @default(false)
  description String?
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  @@unique([tenantId, key])
}
```

- [ ] **Step 3: Generate Prisma client**

Run: `npm run db:generate`
Expected: Prisma client generated successfully

- [ ] **Step 4: Create the first migration**

Run: `npm run db:migrate -- --name init_correhub`
Expected: migration folder created and schema applied to local database

- [ ] **Step 5: Add TypeScript domain types mirroring key Prisma payloads**

```ts
// src/features/groups/types.ts
export type GroupStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface GroupSummary {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  description: string;
  status: GroupStatus;
}
```

### Task 3: Build shared infrastructure, providers, and policies

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/auth/config.ts`
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/security/tenant.ts`
- Create: `src/lib/security/policies.ts`
- Create: `src/features/uploads/storage-provider.ts`
- Create: `src/features/uploads/local-storage-provider.ts`
- Create: `src/features/observability/logger.ts`
- Create: `src/features/feature-flags/service.ts`

- [ ] **Step 1: Create the Prisma singleton**

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 2: Configure Auth.js with credentials and optional Google**

```ts
// src/lib/auth/config.ts
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const providers = [
  Credentials({ /* authorize implementation */ })
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET
  }));
}
```

- [ ] **Step 3: Add tenant resolver and role policies**

```ts
// src/lib/security/policies.ts
export function assertTenantAccess(resourceTenantId: string, actorTenantId: string) {
  if (resourceTenantId !== actorTenantId) {
    throw new Error("Cross-tenant access denied.");
  }
}

export function canModerate(role: string) {
  return role === "ADMIN";
}
```

- [ ] **Step 4: Add storage abstraction and local adapter**

```ts
// src/features/uploads/storage-provider.ts
export interface StorageProvider {
  upload(params: { key: string; body: Buffer; contentType: string }): Promise<{ url: string }>;
  remove(key: string): Promise<void>;
}
```

- [ ] **Step 5: Add structured logger interface**

```ts
// src/features/observability/logger.ts
export interface Logger {
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
  error(event: string, context?: Record<string, unknown>): void;
}
```

- [ ] **Step 6: Verify type-check and lint after infrastructure layer**

Run: `npm run lint`
Expected: no unresolved imports or config-level errors

### Task 4: Seed premium demo data and domain services

**Files:**
- Create: `prisma/seed.ts`
- Create: `src/features/users/services/profile-service.ts`
- Create: `src/features/groups/services/group-service.ts`
- Create: `src/features/events/services/event-service.ts`
- Create: `src/features/attendance/services/attendance-service.ts`
- Create: `src/features/check-in/services/check-in-service.ts`
- Create: `src/features/rankings/services/ranking-service.ts`

- [ ] **Step 1: Write a seed that creates a believable production-like pilot tenant**

```ts
// prisma/seed.ts
async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "sao-lourenco-da-mata" },
    update: {},
    create: {
      slug: "sao-lourenco-da-mata",
      name: "Sao Lourenco da Mata",
      settings: {
        create: {
          cityDisplayName: "Sao Lourenco da Mata",
          primaryColor: "#22C55E"
        }
      }
    }
  });
}
```

- [ ] **Step 2: Seed admins, leaders, runners, groups, events, partners, posts, notifications, and ranking snapshots**

```ts
await prisma.user.createMany({ data: demoUsers });
await prisma.group.createMany({ data: demoGroups });
await prisma.runEvent.createMany({ data: demoEvents });
await prisma.partner.createMany({ data: demoPartners });
```

- [ ] **Step 3: Implement attendance confirmation and cancellation service**

```ts
// src/features/attendance/services/attendance-service.ts
export async function confirmAttendance(input: ConfirmAttendanceInput) {
  return db.attendance.upsert({
    where: { userId_runEventId: { userId: input.userId, runEventId: input.runEventId } },
    update: { status: "CONFIRMED", cancelledAt: null },
    create: { tenantId: input.tenantId, userId: input.userId, runEventId: input.runEventId, status: "CONFIRMED" }
  });
}
```

- [ ] **Step 4: Implement QR check-in service with time-window validation**

```ts
// src/features/check-in/services/check-in-service.ts
export async function createCheckIn(input: CheckInInput) {
  const event = await db.runEvent.findUniqueOrThrow({ where: { id: input.runEventId } });
  assertTenantAccess(event.tenantId, input.tenantId);
  return db.checkIn.create({ data: input });
}
```

- [ ] **Step 5: Run the seed and validate data volume**

Run: `npm run db:seed`
Expected: seed completes with demo tenant, users, groups, events, partners, feed, notifications, and ranking data

### Task 5: Build the design system and global application shell

**Files:**
- Create: `src/styles/globals.css`
- Create: `src/components/shared/button.tsx`
- Create: `src/components/shared/card.tsx`
- Create: `src/components/shared/badge.tsx`
- Create: `src/components/shared/avatar.tsx`
- Create: `src/components/shared/input.tsx`
- Create: `src/components/shared/kpi-card.tsx`
- Create: `src/components/shared/event-card.tsx`
- Create: `src/components/shared/group-card.tsx`
- Create: `src/components/shared/partner-card.tsx`
- Create: `src/components/layout/navbar.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/navigation/bottom-nav.tsx`

- [ ] **Step 1: Define global design tokens in CSS**

```css
/* src/styles/globals.css */
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --primary: #22c55e;
  --primary-strong: #16a34a;
  --muted: #64748b;
  --radius-lg: 1.5rem;
  --shadow-card: 0 20px 60px rgba(15, 23, 42, 0.08);
}
```

- [ ] **Step 2: Create shared primitives with CVA-based variants**

```tsx
// src/components/shared/button.tsx
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="inline-flex min-h-11 items-center justify-center rounded-full px-5" />;
}
```

- [ ] **Step 3: Create layout shell with responsive header and mobile bottom navigation**

```tsx
// src/components/layout/navbar.tsx
export function Navbar() {
  return <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur" />;
}
```

- [ ] **Step 4: Verify visual shell compiles**

Run: `npm run build`
Expected: shared components and global styles compile successfully

### Task 6: Build public product pages and SEO foundations

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/(public)/agenda/page.tsx`
- Create: `src/app/(public)/grupos/page.tsx`
- Create: `src/app/(public)/grupos/[slug]/page.tsx`
- Create: `src/app/(public)/ranking/page.tsx`
- Create: `src/app/(public)/parceiros/page.tsx`
- Create: `src/app/(public)/parceiros/[slug]/page.tsx`
- Create: `src/app/(public)/comunidade/page.tsx`
- Create: `src/app/(public)/buscar/page.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Implement the premium landing page**

```tsx
// src/app/(public)/page.tsx
export default function HomePage() {
  return (
    <main>
      <section>{/* hero premium */}</section>
      <section>{/* animated stats */}</section>
      <section>{/* testimonials */}</section>
      <section>{/* FAQ */}</section>
    </main>
  );
}
```

- [ ] **Step 2: Implement data-driven public listings for groups, events, rankings, partners, feed, and search**

```tsx
// src/app/(public)/agenda/page.tsx
export default async function AgendaPage() {
  const events = await listPublicEvents();
  return <EventGrid events={events} />;
}
```

- [ ] **Step 3: Add Metadata API, sitemap, and robots output**

```ts
// src/app/robots.ts
export default function robots() {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: "https://correhub.app/sitemap.xml" };
}
```

- [ ] **Step 4: Validate the public pages**

Run: `npm run build`
Expected: public routes render without server-side errors

### Task 7: Build authentication, runner dashboard, and private navigation

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/cadastro/page.tsx`
- Create: `src/app/(private)/dashboard/page.tsx`
- Create: `src/app/(private)/perfil/page.tsx`
- Create: `src/app/(private)/notificacoes/page.tsx`
- Create: `src/features/auth/schemas/login-schema.ts`
- Create: `src/features/auth/actions/login.ts`
- Create: `src/features/users/components/profile-form.tsx`

- [ ] **Step 1: Build login and registration forms with Zod and React Hook Form**

```ts
// src/features/auth/schemas/login-schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

- [ ] **Step 2: Implement the runner dashboard with next event, month km, ranking, group, partners, events, and achievements**

```tsx
// src/app/(private)/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getRunnerDashboard();
  return <RunnerDashboard data={data} />;
}
```

- [ ] **Step 3: Protect private routes server-side**

```ts
// src/lib/auth/session.ts
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
```

- [ ] **Step 4: Validate credentials flow locally**

Run: `npm run build`
Expected: auth routes compile and private pages enforce session requirements

### Task 8: Build leader/admin operations, QR check-in, and API v1 routes

**Files:**
- Create: `src/app/(private)/dashboard/grupo/page.tsx`
- Create: `src/app/(private)/dashboard/admin/page.tsx`
- Create: `src/app/(private)/check-in/[eventId]/page.tsx`
- Create: `src/app/api/v1/groups/route.ts`
- Create: `src/app/api/v1/events/route.ts`
- Create: `src/app/api/v1/attendance/route.ts`
- Create: `src/app/api/v1/check-in/route.ts`
- Create: `src/app/api/v1/admin/groups/[id]/approve/route.ts`
- Create: `src/app/api/v1/admin/partners/[id]/approve/route.ts`

- [ ] **Step 1: Build the leader dashboard for event management, moderation status, and feed publishing**

```tsx
// src/app/(private)/dashboard/grupo/page.tsx
export default async function GroupDashboardPage() {
  const data = await getLeaderDashboard();
  return <LeaderDashboard data={data} />;
}
```

- [ ] **Step 2: Build the admin dashboard for moderation queues and global metrics**

```tsx
// src/app/(private)/dashboard/admin/page.tsx
export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();
  return <AdminDashboard data={data} />;
}
```

- [ ] **Step 3: Build QR check-in route and page**

```ts
// src/app/api/v1/check-in/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const result = await createCheckIn(body);
  return Response.json(result);
}
```

- [ ] **Step 4: Build admin moderation endpoints with audit logging**

```ts
// src/app/api/v1/admin/groups/[id]/approve/route.ts
export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await approveGroup(id);
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Verify critical flows manually**

Run: `npm run dev`
Expected: login, public exploration, attendance confirmation, QR check-in, leader dashboard, and admin moderation can be exercised locally

### Task 9: Add tests, polish, and delivery docs

**Files:**
- Create: `src/features/attendance/services/attendance-service.test.ts`
- Create: `src/features/check-in/services/check-in-service.test.ts`
- Create: `src/lib/security/policies.test.ts`
- Create: `src/features/feature-flags/service.test.ts`
- Create: `README.md`

- [ ] **Step 1: Add policy tests for tenant isolation and admin moderation**

```ts
// src/lib/security/policies.test.ts
it("rejects cross-tenant access", () => {
  expect(() => assertTenantAccess("tenant-a", "tenant-b")).toThrow("Cross-tenant access denied.");
});
```

- [ ] **Step 2: Add service tests for attendance idempotency and check-in window validation**

```ts
// src/features/check-in/services/check-in-service.test.ts
it("rejects check-in outside event window", async () => {
  await expect(createCheckIn(input)).rejects.toThrow();
});
```

- [ ] **Step 3: Write the README with setup, env, migrate, seed, dev, and Vercel deploy instructions**

```md
## Setup
1. `npm install`
2. Configure `.env`
3. `npm run db:migrate`
4. `npm run db:seed`
5. `npm run dev`
```

- [ ] **Step 4: Run final verification**

Run: `npm run lint`
Expected: no warnings

Run: `npm run build`
Expected: production build passes

Run: `npm run db:seed`
Expected: seed still succeeds after all schema and UI work
