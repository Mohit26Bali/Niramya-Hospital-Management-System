# Niramaya — Hospital Management System

_Compassion. Care. Excellence._

A full-stack hospital system built as a college project, in two parts sharing one database:

- **Public website** (`/`, `/about`, `/doctors`, `/departments`, `/services`, `/health-packages`, `/blog`, `/contact`, `/emergency`, `/patient-portal`, `/appointments`) — a patient-facing marketing site with a live doctor/department directory, doctor reviews, and a real appointment-booking form.
- **Staff portal** (`/dashboard/*`, behind login at `/login`) — role-based internal system for admins, doctors, nurses, and receptionists to manage patients, doctors, nurses, departments, appointments, admissions, rooms, medical records, prescriptions, and billing.

A booking submitted on the public site creates a real `Appointment` (and `Patient`, if new) that receptionists see immediately in the staff portal — no duplicate tables, the public site reuses the same services as the internal forms.

## Tech stack

- **Framework**: Next.js 15 (App Router), TypeScript (strict), React 19
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js v5 (NextAuth), Credentials provider, JWT sessions, bcrypt password hashing
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table (server-driven pagination/sort via URL params)
- **Charts**: Recharts
- **Seed data**: Faker.js, with Indian name/city/medication pools

## Architecture

```
src/
  app/                    Next.js App Router routes
    (public)/              Public marketing site — no URL segment added, routes live at /, /about, /doctors, …
    (auth)/login/         Public split-screen login page
    dashboard/             Authenticated staff portal (sidebar + header) — routes live at /dashboard/*
    api/                  Auth.js route handler + global search endpoint
  components/
    ui/                   shadcn/ui primitives
    shared/                Reusable DataTable, FormDialog, ConfirmDialog, StatCard, StatusBadge, etc. (staff portal)
    layout/                Sidebar, header, global search, notifications, theme toggle (staff portal)
    public/                Public site nav/footer/sections (doctors, home, booking, etc.)
    charts/                Recharts wrappers used on the dashboard
    <entity>/              Per-entity form, columns, table/view components (staff portal)
  content/                Static marketing content (blog posts, testimonials, health packages) — no DB tables, nothing here is admin-editable
  actions/                "use server" Server Actions — thin wrappers: permission check → Zod parse → service call → revalidatePath
  server/services/        All business logic and Prisma queries live here, not in actions or components
  lib/                    Prisma client singleton, Auth.js config, permissions matrix, pagination helpers, formatting utils
  schemas/                Zod schemas per entity (shared by forms and server actions)
  types/                  Shared types + NextAuth module augmentation
prisma/
  schema.prisma           Full relational schema
  seed.ts                 Seed script (realistic Indian hospital data)
  seed-data/names.ts      Name/city/specialization/medication pools used by the seed script
```

**Why a service layer?** Server Actions stay thin (`requirePermission()` → `schema.parse()` → delegate to a `*Service` function → `revalidatePath()`). All Prisma queries and business rules (e.g. "discharging a patient frees their room") live in `src/server/services/*.service.ts`. This keeps authorization enforcement in one place (`src/lib/permissions.ts`) and keeps the logic testable independent of the Next.js request/response cycle.

## Roles & permissions

| Role | Can | Cannot |
|---|---|---|
| **Admin** | Everything — staff, patients, rooms, billing, appointments, settings | — |
| **Doctor** | View today's appointments, search patients, write prescriptions, create medical records, update diagnosis | Delete patients, edit billing, manage staff |
| **Nurse** | Update patient vitals, update admission status, view assigned patients | Manage billing, delete records |
| **Receptionist** | Register patients, schedule appointments, admit/discharge patients, generate invoices | Modify medical records |

The full capability matrix lives in `src/lib/permissions.ts` and is enforced server-side in every Server Action via `requirePermission(resource, action)` — the UI hiding buttons is a courtesy, not the security boundary.

## Getting started

### 1. Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- A running PostgreSQL 14+ instance

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/niramaya?schema=public"
AUTH_SECRET="generate-with-pnpm-dlx-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Create the database if it doesn't exist yet:

```sql
CREATE DATABASE niramaya;
```

### 4. Run migrations

```bash
pnpm prisma migrate dev --name init
```

### 5. Seed realistic demo data

```bash
pnpm db:seed
```

This wipes and reseeds ~1,400 rows: 8 departments, 12 doctors, 25 nurses, 150 patients, 400 appointments, 300 medical records, 250 prescriptions, 70 admissions, 150 invoices, 50 rooms, and an activity log — all with realistic Indian names, phone numbers, addresses, and medical data, and internally consistent relationships (occupied rooms match active admissions, invoices tie back to real appointments/admissions, etc.).

### 6. Run the app

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site, or go straight to [http://localhost:3000/login](http://localhost:3000/login) for the staff portal.

### Demo accounts

Staff portal login, all seeded with password `password123`:

| Email | Role |
|---|---|
| admin@hospital.com | Admin |
| doctor1@hospital.com | Doctor |
| doctor2@hospital.com | Doctor |
| nurse1@hospital.com | Nurse |
| reception@hospital.com | Receptionist |

## Useful scripts

```bash
pnpm dev          # start dev server
pnpm build        # production build (also type-checks)
pnpm start        # run the production build
pnpm db:push      # push schema changes without a migration (quick prototyping)
pnpm db:migrate   # create + apply a new migration
pnpm db:seed      # wipe and reseed demo data
pnpm db:studio    # open Prisma Studio to browse the database
```

## Data model

Ten core entities plus supporting tables:

- **Department** — hospital departments (Cardiology, Neurology, …)
- **Doctor** / **Nurse** — staff, each with a linked `User` account for login
- **Patient** — demographics, contact, insurance, medical summary
- **Appointment** — scheduled visits, linked to a patient/doctor/department
- **MedicalRecord** — diagnosis, vitals, treatment notes per visit
- **Prescription** + **PrescriptionItem** — medications as proper relational line items, not JSON
- **Room** — beds/wards, tracked by occupancy status
- **Admission** — inpatient stays, transactionally keeps Room status in sync
- **Invoice** + **InvoiceItem** — billing, also relational line items
- **AuditLog** — who did what, surfaced on the admin-only Activity Log page
- **HospitalProfile** — the single editable row backing the Settings page
- **DoctorReview** — seeded patient reviews shown on public doctor profiles (`Doctor.bio` + this table are the only additions made for the public site; everything else on the marketing pages — blog posts, testimonials, health packages — is static content in `src/content/`, not database-backed, since none of it has an admin-editing UI)

Soft deletes (`isActive` / `deletedAt`) are used for master data that hospitals don't actually erase (Doctor, Nurse, Patient, Department, Room). Transactional/append-only records (Appointment, Admission, MedicalRecord, Prescription, Invoice, AuditLog) are never soft-deleted — they use status fields instead, or in rare admin-only cases a real delete.

## Design system

Two deliberately distinct palettes, both implemented as CSS custom properties in `src/app/globals.css` so shadcn/ui components pick them up automatically with no per-component overrides:

- **Staff portal**: white/light-gray surfaces, medical blue (`#2563EB`) primary accent, emerald (`#10B981`) secondary, slate (`#0F172A`) sidebar — professional, information-dense.
- **Public site**: a `.public` class (applied once at `src/app/(public)/layout.tsx`) overrides the same tokens to a calmer deep teal (`#0F766E`) primary + emerald secondary — welcoming, premium. Dashboard charts keep the original blue/emerald/amber categorical palette everywhere regardless of which site they're used on.

No gradients, no glassmorphism, subtle 150–200ms transitions only. Dark mode is fully themed via `next-themes` for both palettes.

Real photography is used sparingly and deliberately: the homepage hero background (`public/bg.png`), the About page team photo (`public/team.png`), and the four News & Events card banners (`public/events/*.png`). Everything else on the public site uses generated content — doctor "photos" are DiceBear-generated monogram avatars (`doctorAvatarUrl()` in `src/lib/utils.ts`), not real images.

## Deployment

This is a standard Next.js + PostgreSQL app, so any platform that runs Node works. The straightforward path:

1. **Database**: provision a managed PostgreSQL instance — [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) all have free tiers and give you a `DATABASE_URL` immediately. (Don't reuse the local `niramaya` database from development — start clean.)
2. **Host the app on [Vercel](https://vercel.com)** (built by the makers of Next.js, zero-config for this stack):
   - Push this repo to GitHub, then import it in Vercel.
   - Set environment variables in the Vercel project settings: `DATABASE_URL` (from step 1), `AUTH_SECRET` (generate a new one for production with `pnpm dlx auth secret` — never reuse the dev one), `NEXTAUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`).
   - Vercel runs `pnpm build` automatically. Add `prisma migrate deploy` to the build step so migrations apply on every deploy — either set the project's **Build Command** to `pnpm prisma migrate deploy && pnpm build`, or add a `postinstall`/`vercel-build` script in `package.json` that does the same.
3. **Seed production data once**, after the first successful deploy: run `pnpm db:seed` locally with `DATABASE_URL` temporarily pointed at the production database (or via Vercel's CLI: `vercel env pull` to get the prod env vars locally, then `pnpm db:seed`). Do this once — re-running it wipes and reseeds, which you don't want on a live site once real bookings start coming in.
4. **Auth callback URL**: Auth.js needs `NEXTAUTH_URL` to match your real deployed domain exactly, or login redirects will break.

Alternative hosts (Railway, Render, a plain VPS) work the same way — the only Vercel-specific part above is the build-command wiring; everything else (env vars, migrate-then-build, one-time seed) applies universally.

## Future scope

Deliberately out of scope for this project (see the design brief): pharmacy/inventory management, laboratory management, payroll, and ambulance tracking. The data model and service-layer architecture are built to extend cleanly into those modules later without a redesign.
