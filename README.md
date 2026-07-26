# Niramaya — Hospital Management System

_Compassion. Care. Excellence._

A full-stack hospital management system built as a college project: role-based staff portal for admins, doctors, nurses, and receptionists to manage patients, doctors, nurses, departments, appointments, admissions, rooms, medical records, prescriptions, and billing.

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
    (auth)/login/         Public split-screen login page
    (dashboard)/          Authenticated shell (sidebar + header) — one folder per entity
    api/                  Auth.js route handler + global search endpoint
  components/
    ui/                   shadcn/ui primitives
    shared/                Reusable DataTable, FormDialog, ConfirmDialog, StatCard, StatusBadge, etc.
    layout/                Sidebar, header, global search, notifications, theme toggle
    charts/                Recharts wrappers used on the dashboard
    <entity>/              Per-entity form, columns, table/view components
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

Visit [http://localhost:3000](http://localhost:3000).

### Demo accounts

All seeded with password `password123`:

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

Soft deletes (`isActive` / `deletedAt`) are used for master data that hospitals don't actually erase (Doctor, Nurse, Patient, Department, Room). Transactional/append-only records (Appointment, Admission, MedicalRecord, Prescription, Invoice, AuditLog) are never soft-deleted — they use status fields instead, or in rare admin-only cases a real delete.

## Design system

White/light-gray surfaces, medical blue (`#2563EB`) primary accent, emerald (`#10B981`) secondary, slate (`#0F172A`) sidebar — no gradients, no glassmorphism, subtle 150–200ms transitions only. Dark mode is fully themed via `next-themes` and CSS custom properties (`src/app/globals.css`).

## Future scope

Deliberately out of scope for this project (see the design brief): pharmacy/inventory management, laboratory management, payroll, and ambulance tracking. The data model and service-layer architecture are built to extend cleanly into those modules later without a redesign.
