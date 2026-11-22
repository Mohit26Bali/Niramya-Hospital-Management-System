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

| Area | Admin | Doctor | Nurse | Receptionist |
|---|---|---|---|---|
| Patients (demographics) | full | read | read | register / edit |
| Medical records, prescriptions | full | write | read | **no access** |
| Appointments | full | own schedule | read | book / change |
| Admissions and rooms | full | read | update status | admit / discharge |
| Invoices and payments | full | **no access** | **no access** | create / record payments |
| Staff accounts, settings, activity log | full | — | — | — |
| Website contact messages | full | — | — | read / mark handled |

Enforced on the server, not just in the UI:

- Every Server Action (reads included) calls `requirePermission(resource, action)`. Server Actions are public HTTP endpoints, so each one checks for itself.
- The check re-reads the user from the database each time: a deactivated user, or a changed role, takes effect immediately (the signed-in browser is redirected to `/login?reason=ended`).
- Clinical and billing data are scoped: the patient chart only loads the tabs your role may see, and the dashboard hides revenue from clinicians.
- Opening a patient chart is written to the activity log (`VIEW`).
- The matrix lives in `src/lib/permissions.ts`.

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

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | Signs session tokens (`pnpm dlx auth secret`); different per environment |
| `NEXTAUTH_URL` | yes | Public URL of the app |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | for `db:bootstrap` | First administrator |
| `NEXT_PUBLIC_HOSPITAL_TIMEZONE` | no (Asia/Kolkata) | Zone for "today", appointment hours, monthly reports |
| `BOOKING_OPEN_HOUR`, `BOOKING_CLOSE_HOUR` | no (8, 20) | Hours when public online booking is accepted |
| `TRUSTED_PROXY_HOPS` | no (0) | Reverse proxies in front of the app; decides whether `X-Forwarded-For` is trusted for rate limits |
| `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` | no (false) | Shows the demo logins on the login page (demo only) |
| `ALLOW_SEED_WIPE` | no | Lets `db:seed` wipe a non-local or production database. Do not set on a real system |

Create the database (`CREATE DATABASE niramaya;`), then apply migrations:

```bash
pnpm db:deploy      # applies prisma/migrations (use db:migrate while developing schema changes)
```

### 4. First administrator (real use)

```bash
pnpm db:bootstrap   # reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME; safe to re-run
```

The admin must change the password at first sign-in. Staff accounts are then created from the portal: the creating admin sees a temporary password once, and the new user must replace it before using anything.

### 5. Or: demo data

```bash
pnpm db:seed
```

**Wipes the database** and loads ~1,400 fictional rows (8 departments, 12 doctors, 25 nurses, 150 patients, 400 appointments, rooms, invoices, …). It refuses to run against a non-local host or `NODE_ENV=production`. Demo accounts (password `password123`): `admin@hospital.com`, `doctor1@hospital.com`, `doctor2@hospital.com`, `nurse1@hospital.com`, `reception@hospital.com`. These exist only in seeded demo databases.

### 6. Run

```bash
pnpm dev
```

Public site at [http://localhost:3000](http://localhost:3000), staff portal at [/login](http://localhost:3000/login).

## Useful scripts

```bash
pnpm dev          # start dev server
pnpm build        # production build (also type-checks)
pnpm start        # run the production build
pnpm db:push      # push schema changes without a migration (quick prototyping)
pnpm db:migrate   # create + apply a new migration (development)
pnpm db:deploy    # apply existing migrations (production)
pnpm db:bootstrap # create the first admin on a real database
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
   - Vercel runs `pnpm build` automatically. Add `prisma migrate deploy` to the build step so migrations apply on every deploy (an existing database with two open admissions for one patient will fail the new unique index: discharge the duplicate first) — either set the project's **Build Command** to `pnpm prisma migrate deploy && pnpm build`, or add a `postinstall`/`vercel-build` script in `package.json` that does the same.
3. **Create the first administrator** with `pnpm db:bootstrap` (set `ADMIN_EMAIL`/`ADMIN_PASSWORD` for that one command). **Do not run `db:seed` on a live system**: it wipes data, creates accounts with a publicly documented password, and refuses to run there anyway.
   Set `TRUSTED_PROXY_HOPS=1` behind Vercel so rate limits see the visitor's address.
4. **Auth callback URL**: Auth.js needs `NEXTAUTH_URL` to match your real deployed domain exactly, or login redirects will break.

Alternative hosts (Railway, Render, a plain VPS) work the same way — the only Vercel-specific part above is the build-command wiring; everything else (env vars, migrate-then-build, one-time seed) applies universally.

## Security measures

- Session cookies (JWT) last 8 hours; sign-in limited per address and per account, with generic errors and constant-time password comparison for unknown emails.
- Passwords: bcrypt cost 12, minimum 10 characters with letters and numbers, common-password list, forced change after an admin-issued temporary password.
- Public booking and contact forms: per-address and per-phone limits, hidden honeypot field, bounded input, no patient numbers returned, existing patients are only reused when phone, date of birth and last name all match.
- Security headers (CSP, frame denial, nosniff, referrer policy, HSTS), `no-store` on `/dashboard` and `/api`.
- Money is calculated in whole paise; payments are locked and can only go up to the invoice total.
- Appointment and bed bookings are serialised with database advisory locks; a patient can hold only one open admission (partial unique index); document numbers come from an atomic counter.

## Known limitations

- Rate limits and sign-in lockouts live in memory: per server instance, reset on restart. Several instances or serverless need a shared store (Redis) for strict limits.
- No password-reset email flow (an admin issues a new temporary password), no two-factor sign-in.
- Audit trail records changes and patient-chart opens, not every read of a list.
- No vitals ranges, drug-allergy or interaction checks; clinical safety rules are out of scope.
- Public bookings create a pending appointment (and a placeholder patient if new); staff must confirm and complete the details by phone.
- Contact messages are stored, not emailed; someone must check **Messages** in the portal.
- No automated email/SMS reminders, no file uploads (reports, scans), no insurance claims.
- Test coverage covers the services and access rules (run locally, not in this repository); there is no CI.

## Possible improvements

Shared rate-limit store, email/SMS notifications, password reset and MFA, full read audit, appointment slots per doctor schedule, pharmacy/lab/payroll modules, backups and retention policy, accessibility audit with assistive-technology testing.
