-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'VIEW';
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3);
-- CreateTable
CREATE TABLE "Counter" (
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Counter_pkey" PRIMARY KEY ("name")
);
-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- Start each counter at the highest number already issued, so new numbers never collide with old ones.
INSERT INTO "Counter" ("name", "value")
SELECT 'PAT', COALESCE(MAX(NULLIF(regexp_replace("patientNumber", '\D', '', 'g'), '')::int), 0) FROM "Patient"
UNION ALL SELECT 'APT', COALESCE(MAX(NULLIF(regexp_replace("appointmentNumber", '\D', '', 'g'), '')::int), 0) FROM "Appointment"
UNION ALL SELECT 'ADM', COALESCE(MAX(NULLIF(regexp_replace("admissionNumber", '\D', '', 'g'), '')::int), 0) FROM "Admission"
UNION ALL SELECT 'INV', COALESCE(MAX(NULLIF(regexp_replace("invoiceNumber", '\D', '', 'g'), '')::int), 0) FROM "Invoice"
UNION ALL SELECT 'DOC', COALESCE(MAX(NULLIF(regexp_replace("employeeCode", '\D', '', 'g'), '')::int), 0) FROM "Doctor"
UNION ALL SELECT 'NUR', COALESCE(MAX(NULLIF(regexp_replace("employeeCode", '\D', '', 'g'), '')::int), 0) FROM "Nurse"
ON CONFLICT ("name") DO NOTHING;

-- A patient can have at most one open admission at a time (also stops two clerks admitting the same patient at once).
CREATE UNIQUE INDEX "Admission_one_open_per_patient" ON "Admission"("patientId") WHERE "status" = 'ADMITTED';
