/**
 * Prepares an EMPTY database for real use. Unlike the demo seed it deletes nothing and creates no demo data.
 *
 *   ADMIN_EMAIL=you@hospital.org ADMIN_PASSWORD='a long password' ADMIN_NAME='Your Name' pnpm db:bootstrap
 *
 * It creates: the first administrator (with the password you give, no default), the website's audit-only system
 * account, the hospital profile row, and the number counters. Safe to run again: existing rows are left alone.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { passwordProblem } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_NAME) before running this.");
  }
  const problem = passwordProblem(password, email);
  if (problem) throw new Error(`ADMIN_PASSWORD is not acceptable: ${problem}`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`An account for ${email} already exists. Left unchanged.`);
  } else {
    await prisma.user.create({
      data: { name, email, passwordHash: bcrypt.hashSync(password, 12), role: Role.ADMIN, passwordChangedAt: new Date() },
    });
    console.log(`Created administrator ${email}.`);
  }

  // The website records bookings under this account. It can never sign in (inactive, random password).
  const systemEmail = "website@niramaya.internal";
  if (!(await prisma.user.findUnique({ where: { email: systemEmail } }))) {
    const random = crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
    await prisma.user.create({
      data: { name: "Public Website", email: systemEmail, passwordHash: bcrypt.hashSync(random, 12), role: Role.RECEPTIONIST, isActive: false },
    });
    console.log("Created the website audit account.");
  }

  for (const name of ["PAT", "APT", "ADM", "INV", "DOC", "NUR"]) {
    await prisma.counter.upsert({ where: { name }, create: { name, value: 0 }, update: {} });
  }

  console.log("Done. Sign in at /login with the administrator account, then add departments, doctors and rooms.");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
