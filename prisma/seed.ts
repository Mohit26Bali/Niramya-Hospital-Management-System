import { PrismaClient, Gender, BloodGroup, Shift, RoomType, RoomStatus, AppointmentStatus, AdmissionStatus, InvoiceStatus, PaymentMethod, InvoiceItemCategory, Role, AuditAction } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import {
  INDIAN_MALE_FIRST_NAMES,
  INDIAN_FEMALE_FIRST_NAMES,
  INDIAN_LAST_NAMES,
  INDIAN_CITIES,
  DEPARTMENT_SEED,
  SPECIALIZATIONS,
  QUALIFICATIONS,
  DIAGNOSES,
  SYMPTOMS_POOL,
  MEDICATIONS,
  randomIndianPhone,
  randomPincode,
} from "./seed-data/names";

const prisma = new PrismaClient();

faker.seed(42);

// ── Helpers ─────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function sample<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min;
  return Number(v.toFixed(decimals));
}

function pad(prefix: string, n: number, width: number): string {
  return `${prefix}-${String(n).padStart(width, "0")}`;
}

function fullName(gender: Gender): { firstName: string; lastName: string } {
  const firstName =
    gender === Gender.MALE
      ? pick(INDIAN_MALE_FIRST_NAMES)
      : gender === Gender.FEMALE
        ? pick(INDIAN_FEMALE_FIRST_NAMES)
        : pick([...INDIAN_MALE_FIRST_NAMES, ...INDIAN_FEMALE_FIRST_NAMES]);
  const lastName = pick(INDIAN_LAST_NAMES);
  return { firstName, lastName };
}

function randomGender(): Gender {
  return pick([Gender.MALE, Gender.FEMALE]);
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

const BLOOD_GROUPS: BloodGroup[] = [
  BloodGroup.A_POS, BloodGroup.A_NEG, BloodGroup.B_POS, BloodGroup.B_NEG,
  BloodGroup.AB_POS, BloodGroup.AB_NEG, BloodGroup.O_POS, BloodGroup.O_NEG,
];

const INSURERS = ["Star Health", "HDFC Ergo", "ICICI Lombard", "National Insurance", "Bajaj Allianz", "Max Bupa"];
const ALLERGY_POOL = ["Penicillin", "Peanuts", "Dust", "Pollen", "Sulfa drugs", "Latex", "None known"];
const INSTRUCTIONS_POOL = ["Take after food", "Take before bed", "As needed", "Take on empty stomach", "Avoid alcohol while on this medication"];
const DOCTOR_NOTE_TEMPLATES = [
  "Patient responding well to treatment. Advised follow-up in 2 weeks.",
  "Condition stable. Continue current medication regimen.",
  "Mild improvement noted. Recommend lifestyle modifications.",
  "Patient advised to monitor symptoms and report if they worsen.",
  "Follow-up required to reassess vitals and lab results.",
  "No significant changes since last visit. Continue monitoring.",
];
const TREATMENT_PLAN_TEMPLATES = [
  "Prescribed medication course, advised rest and hydration.",
  "Recommended physiotherapy sessions twice a week.",
  "Dietary changes advised along with prescribed medication.",
  "Referred for further diagnostic tests.",
  "Continue current medication, review after 4 weeks.",
];
const ADMITTED_BY_NAMES = ["Reception Desk", "Anjali Front Desk", "Ramesh Admissions", "Priya Reception", "Suresh Front Office"];

async function main() {
  console.log("Wiping existing data...");
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.prescriptionItem.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.medicalRecord.deleteMany(),
    prisma.admission.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.room.deleteMany(),
    prisma.nurse.deleteMany(),
    prisma.doctor.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
    prisma.hospitalProfile.deleteMany(),
  ]);

  // ── Hospital Profile ────────────────────────────────────────────────
  console.log("Seeding hospital profile...");
  await prisma.hospitalProfile.create({
    data: {
      name: "Niramaya",
      tagline: "Compassion. Care. Excellence.",
      logoUrl: "/logo.png",
      address: "45 MG Road, Bengaluru, Karnataka 560001",
      phone: randomIndianPhone(),
      email: "info@niramaya.com",
    },
  });

  // ── Departments ─────────────────────────────────────────────────────
  console.log("Seeding departments...");
  const departments: Record<string, { id: string; name: string }> = {};
  for (const dept of DEPARTMENT_SEED) {
    const created = await prisma.department.create({
      data: {
        name: dept.name,
        floor: dept.floor,
        description: dept.description,
        phone: randomIndianPhone(),
      },
    });
    departments[dept.name] = created;
  }
  const departmentList = Object.values(departments);

  const passwordHash = bcrypt.hashSync("password123", 10);
  const usedEmails = new Set<string>();

  // ── Named demo users + Doctors/Nurses ───────────────────────────────
  console.log("Seeding demo users...");
  await prisma.user.create({
    data: { name: "Admin User", email: "admin@hospital.com", passwordHash, role: Role.ADMIN },
  });
  await prisma.user.create({
    data: { name: "Reception Desk", email: "reception@hospital.com", passwordHash, role: Role.RECEPTIONIST },
  });

  type DoctorRec = { id: string; departmentId: string; consultationFee: number };
  type NurseRec = { id: string; departmentId: string | null };
  const doctors: DoctorRec[] = [];
  const nurses: NurseRec[] = [];

  let doctorSeq = 0;
  let nurseSeq = 0;

  async function createDoctor(opts: {
    email: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    departmentName: string;
  }) {
    doctorSeq++;
    const employeeCode = pad("DOC", doctorSeq, 5);
    const dept = departments[opts.departmentName];
    const specialization = pick(SPECIALIZATIONS[opts.departmentName]);
    const user = await prisma.user.create({
      data: {
        name: `Dr. ${opts.firstName} ${opts.lastName}`,
        email: opts.email,
        passwordHash,
        role: Role.DOCTOR,
      },
    });
    const consultationFee = randInt(500, 2500);
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        employeeCode,
        departmentId: dept.id,
        firstName: opts.firstName,
        lastName: opts.lastName,
        gender: opts.gender,
        specialization,
        phone: randomIndianPhone(),
        qualification: pick(QUALIFICATIONS),
        yearsExperience: randInt(2, 30),
        consultationFee,
        isAvailable: Math.random() < 0.85,
      },
    });
    doctors.push({ id: doctor.id, departmentId: dept.id, consultationFee });
  }

  async function createNurse(opts: {
    email: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    departmentName: string | null;
  }) {
    nurseSeq++;
    const employeeCode = pad("NUR", nurseSeq, 5);
    const dept = opts.departmentName ? departments[opts.departmentName] : null;
    const user = await prisma.user.create({
      data: {
        name: `${opts.firstName} ${opts.lastName}`,
        email: opts.email,
        passwordHash,
        role: Role.NURSE,
      },
    });
    const nurse = await prisma.nurse.create({
      data: {
        userId: user.id,
        employeeCode,
        departmentId: dept?.id ?? null,
        firstName: opts.firstName,
        lastName: opts.lastName,
        gender: opts.gender,
        phone: randomIndianPhone(),
        shift: pick([Shift.MORNING, Shift.EVENING, Shift.NIGHT]),
      },
    });
    nurses.push({ id: nurse.id, departmentId: dept?.id ?? null });
  }

  usedEmails.add("admin@hospital.com");
  usedEmails.add("reception@hospital.com");

  await createDoctor({ email: "doctor1@hospital.com", firstName: "Rajesh", lastName: "Sharma", gender: Gender.MALE, departmentName: "Cardiology" });
  usedEmails.add("doctor1@hospital.com");
  await createDoctor({ email: "doctor2@hospital.com", firstName: "Anjali", lastName: "Mehta", gender: Gender.FEMALE, departmentName: "General Medicine" });
  usedEmails.add("doctor2@hospital.com");
  await createNurse({ email: "nurse1@hospital.com", firstName: "Priya", lastName: "Nair", gender: Gender.FEMALE, departmentName: "Cardiology" });
  usedEmails.add("nurse1@hospital.com");

  // ── 10 more doctors, distributed across all 8 departments ──────────
  console.log("Seeding additional doctors...");
  function uniqueEmail(firstName: string, lastName: string): string {
    let base = `dr.${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
    let email = `${base}@niramaya.com`;
    let i = 1;
    while (usedEmails.has(email)) {
      email = `${base}${i}@niramaya.com`;
      i++;
    }
    usedEmails.add(email);
    return email;
  }

  for (let i = 0; i < 10; i++) {
    const deptName = DEPARTMENT_SEED[i % DEPARTMENT_SEED.length].name;
    const gender = randomGender();
    const { firstName, lastName } = fullName(gender);
    const email = uniqueEmail(firstName, lastName);
    await createDoctor({ email, firstName, lastName, gender, departmentName: deptName });
  }

  // ── 24 more nurses ───────────────────────────────────────────────────
  console.log("Seeding additional nurses...");
  function uniqueNurseEmail(firstName: string, lastName: string): string {
    let base = `nurse.${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
    let email = `${base}@niramaya.com`;
    let i = 1;
    while (usedEmails.has(email)) {
      email = `${base}${i}@niramaya.com`;
      i++;
    }
    usedEmails.add(email);
    return email;
  }

  for (let i = 0; i < 24; i++) {
    const gender = randomGender();
    const { firstName, lastName } = fullName(gender);
    const email = uniqueNurseEmail(firstName, lastName);
    const departmentName = Math.random() < 0.9 ? DEPARTMENT_SEED[i % DEPARTMENT_SEED.length].name : null;
    await createNurse({ email, firstName, lastName, gender, departmentName });
  }

  // ── Rooms ────────────────────────────────────────────────────────────
  console.log("Seeding rooms...");
  type RoomRec = { id: string; roomNumber: string; type: RoomType; ratePerDay: number; status: RoomStatus };
  const rooms: RoomRec[] = [];
  const usedRoomNumbers = new Set<string>();
  const roomTypeWeights: { value: RoomType; weight: number }[] = [
    { value: RoomType.GENERAL, weight: 45 },
    { value: RoomType.PRIVATE, weight: 30 },
    { value: RoomType.ICU, weight: 15 },
    { value: RoomType.EMERGENCY, weight: 10 },
  ];

  function rateFor(type: RoomType): number {
    switch (type) {
      case RoomType.GENERAL: return randInt(1200, 1800);
      case RoomType.PRIVATE: return randInt(3500, 4800);
      case RoomType.ICU: return randInt(9000, 12000);
      case RoomType.EMERGENCY: return randInt(5000, 7000);
    }
  }

  for (let i = 0; i < 50; i++) {
    const floor = randInt(1, 5);
    let roomNumber: string;
    do {
      const suffix = Math.random() < 0.3 ? pick(["A", "B", "C"]) : "";
      roomNumber = `${floor}${String(randInt(1, 40)).padStart(2, "0")}${suffix}`;
    } while (usedRoomNumbers.has(roomNumber));
    usedRoomNumbers.add(roomNumber);
    const type = pickWeighted(roomTypeWeights);
    const ratePerDay = rateFor(type);
    // Start mostly AVAILABLE; a small cleaning fraction. Admission seeding
    // step below will flip specific rooms to OCCUPIED consistently.
    const status = Math.random() < 0.05 ? RoomStatus.CLEANING : RoomStatus.AVAILABLE;
    const room = await prisma.room.create({
      data: {
        roomNumber,
        type,
        floor,
        capacity: type === RoomType.ICU ? 1 : randInt(1, 2),
        ratePerDay,
        status,
      },
    });
    rooms.push({ id: room.id, roomNumber: room.roomNumber, type: room.type, ratePerDay, status: room.status });
  }

  // ── Patients ─────────────────────────────────────────────────────────
  console.log("Seeding patients...");
  type PatientRec = { id: string; patientNumber: string; registeredAt: Date; gender: Gender };
  const patients: PatientRec[] = [];

  for (let i = 1; i <= 150; i++) {
    const gender = randomGender();
    const { firstName, lastName } = fullName(gender);
    const patientNumber = pad("PAT", i, 5);
    const ageYears = randInt(1, 85);
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - ageYears);
    dob.setMonth(randInt(0, 11));
    dob.setDate(randInt(1, 28));

    const cityInfo = pick(INDIAN_CITIES);
    const hasInsurance = Math.random() < 0.6;
    const hasAllergies = Math.random() < 0.2;
    const hasChronic = Math.random() < 0.25;

    // registeredAt skewed recent over past ~2 years
    const daysBack = Math.floor(Math.pow(Math.random(), 1.8) * 730);
    const registeredAt = daysAgo(daysBack);

    const { firstName: ecFirst, lastName: ecLast } = fullName(randomGender());

    const patient = await prisma.patient.create({
      data: {
        patientNumber,
        firstName,
        lastName,
        gender,
        dob,
        bloodGroup: Math.random() < 0.9 ? pick(BLOOD_GROUPS) : null,
        phone: randomIndianPhone(),
        email: Math.random() < 0.7 ? `${firstName}.${lastName}${i}@example.com`.toLowerCase() : null,
        address: `${randInt(1, 999)}, ${pick(["MG Road", "Park Street", "Church Street", "Station Road", "Ring Road", "Gandhi Nagar", "Nehru Colony"])}`,
        city: cityInfo.city,
        state: cityInfo.state,
        pincode: randomPincode(),
        emergencyContactName: `${ecFirst} ${ecLast}`,
        emergencyContactPhone: randomIndianPhone(),
        insuranceProvider: hasInsurance ? pick(INSURERS) : null,
        insuranceNumber: hasInsurance ? faker.string.alphanumeric(10).toUpperCase() : null,
        allergies: hasAllergies ? pick(ALLERGY_POOL) : null,
        chronicConditions: hasChronic ? pick(DIAGNOSES) : null,
        avatarSeed: patientNumber,
        registeredAt,
        createdAt: registeredAt,
      },
    });
    patients.push({ id: patient.id, patientNumber, registeredAt, gender });
  }

  // ── Appointments ─────────────────────────────────────────────────────
  console.log("Seeding appointments...");
  type AppointmentRec = {
    id: string;
    patientId: string;
    doctorId: string;
    departmentId: string;
    scheduledAt: Date;
    status: AppointmentStatus;
    consultationFee: number;
  };
  const appointments: AppointmentRec[] = [];

  for (let i = 1; i <= 400; i++) {
    const patient = pick(patients);
    const doctor = pick(doctors);
    const appointmentNumber = pad("APT", i, 6);

    // scheduledAt spread from 3 months ago to 2 weeks in the future
    const totalRangeDays = 90 + 14;
    const offsetDays = randInt(0, totalRangeDays) - 90;
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + offsetDays);
    scheduledAt.setHours(randInt(9, 17), pick([0, 15, 30, 45]), 0, 0);

    const isPast = scheduledAt < new Date();
    let status: AppointmentStatus;
    if (isPast) {
      status = pickWeighted([
        { value: AppointmentStatus.COMPLETED, weight: 75 },
        { value: AppointmentStatus.CANCELLED, weight: 7 },
        { value: AppointmentStatus.NO_SHOW, weight: 3 },
        { value: AppointmentStatus.COMPLETED, weight: 15 },
      ]);
    } else {
      status = pickWeighted([
        { value: AppointmentStatus.SCHEDULED, weight: 55 },
        { value: AppointmentStatus.CONFIRMED, weight: 40 },
        { value: AppointmentStatus.CANCELLED, weight: 5 },
      ]);
    }

    const durationMins = pickWeighted([
      { value: 15, weight: 15 },
      { value: 30, weight: 55 },
      { value: 45, weight: 20 },
      { value: 60, weight: 10 },
    ]);

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        scheduledAt,
        durationMins,
        status,
        reason: pick(DIAGNOSES),
      },
    });
    appointments.push({
      id: appointment.id,
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: doctor.departmentId,
      scheduledAt,
      status,
      consultationFee: doctor.consultationFee,
    });
  }

  const completedPastAppointments = appointments.filter(
    (a) => a.status === AppointmentStatus.COMPLETED && a.scheduledAt < new Date()
  );

  // ── Medical Records ──────────────────────────────────────────────────
  console.log("Seeding medical records...");
  type MedicalRecordRec = { id: string; patientId: string; doctorId: string };
  const medicalRecords: MedicalRecordRec[] = [];

  const appointmentsForRecords = sample(completedPastAppointments, Math.min(220, completedPastAppointments.length));
  const usedAppointmentIdsForRecords = new Set(appointmentsForRecords.map((a) => a.id));

  function randomVitals() {
    const hasVitals = Math.random() < 0.85;
    if (!hasVitals) return null;
    const isElevatedBp = Math.random() < 0.2;
    return {
      temperatureC: randFloat(36.0, 39.5, 1),
      bloodPressure: isElevatedBp ? `${randInt(135, 160)}/${randInt(85, 100)}` : `${randInt(105, 125)}/${randInt(70, 84)}`,
      heartRateBpm: randInt(60, 110),
      respiratoryRate: randInt(12, 20),
      spo2: randInt(94, 100),
      weightKg: randFloat(40, 100, 1),
      heightCm: randFloat(145, 190, 1),
    };
  }

  for (const apt of appointmentsForRecords) {
    const vitals = randomVitals();
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        appointmentId: apt.id,
        visitDate: apt.scheduledAt,
        chiefComplaint: pick(DIAGNOSES),
        symptoms: sample(SYMPTOMS_POOL, randInt(1, 4)).join(", "),
        diagnosis: pick(DIAGNOSES),
        treatmentPlan: pick(TREATMENT_PLAN_TEMPLATES),
        doctorNotes: pick(DOCTOR_NOTE_TEMPLATES),
        ...(vitals ?? {}),
        vitalsUpdatedAt: vitals ? apt.scheduledAt : null,
        createdAt: apt.scheduledAt,
      },
    });
    medicalRecords.push({ id: record.id, patientId: apt.patientId, doctorId: apt.doctorId });
  }

  const standaloneNeeded = 300 - medicalRecords.length;
  for (let i = 0; i < standaloneNeeded; i++) {
    const patient = pick(patients);
    const doctor = pick(doctors);
    const vitals = randomVitals();
    const visitDate = daysAgo(randInt(1, 180));
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        visitDate,
        chiefComplaint: pick(DIAGNOSES),
        symptoms: sample(SYMPTOMS_POOL, randInt(1, 4)).join(", "),
        diagnosis: pick(DIAGNOSES),
        treatmentPlan: pick(TREATMENT_PLAN_TEMPLATES),
        doctorNotes: pick(DOCTOR_NOTE_TEMPLATES),
        ...(vitals ?? {}),
        vitalsUpdatedAt: vitals ? visitDate : null,
        createdAt: visitDate,
      },
    });
    medicalRecords.push({ id: record.id, patientId: patient.id, doctorId: doctor.id });
  }

  // ── Prescriptions + Items ───────────────────────────────────────────
  console.log("Seeding prescriptions...");
  const prescriptionRecords: { id: string; patientId: string }[] = [];
  const recordsForPrescriptions = sample(medicalRecords, Math.min(150, medicalRecords.length));

  for (let i = 0; i < 250; i++) {
    const linkToRecord = i < recordsForPrescriptions.length;
    const record = linkToRecord ? recordsForPrescriptions[i] : null;
    const patient = record ? patients.find((p) => p.id === record.patientId)! : pick(patients);
    const doctor = record ? doctors.find((d) => d.id === record.doctorId) ?? pick(doctors) : pick(doctors);

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        medicalRecordId: record?.id ?? null,
        issuedAt: daysAgo(randInt(0, 180)),
      },
    });

    const items = sample(MEDICATIONS, randInt(1, 4));
    await prisma.$transaction(
      items.map((med) =>
        prisma.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            medicineName: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            durationDays: randInt(3, 30),
            instructions: pick(INSTRUCTIONS_POOL),
          },
        })
      )
    );

    prescriptionRecords.push({ id: prescription.id, patientId: patient.id });
  }

  // ── Admissions ───────────────────────────────────────────────────────
  console.log("Seeding admissions...");
  type AdmissionRec = {
    id: string;
    patientId: string;
    doctorId: string;
    roomId: string;
    admittedAt: Date;
    status: AdmissionStatus;
    days: number;
  };
  const admissions: AdmissionRec[] = [];
  const occupiedRoomIds = new Set<string>();
  const finalRoomStatus = new Map<string, RoomStatus>();

  for (let i = 1; i <= 70; i++) {
    const availableRooms = rooms.filter((r) => !occupiedRoomIds.has(r.id));
    if (availableRooms.length === 0) break;
    const room = pick(availableRooms);
    occupiedRoomIds.add(room.id);

    const patient = pick(patients);
    const doctor = pick(doctors);
    const nurse = Math.random() < 0.6 ? pick(nurses) : null;

    const admittedAt = daysAgo(randInt(0, 45));
    const isDischarged = Math.random() < 0.5;
    const admissionNumber = pad("ADM", i, 5);

    let dischargedAt: Date | null = null;
    let dischargeSummary: string | null = null;
    let status: AdmissionStatus = AdmissionStatus.ADMITTED;
    let days = 1;

    if (isDischarged) {
      status = AdmissionStatus.DISCHARGED;
      const hoursLater = randInt(4, 24 * 14);
      dischargedAt = addHours(admittedAt, hoursLater);
      if (dischargedAt > new Date()) dischargedAt = new Date();
      days = Math.max(1, Math.ceil((dischargedAt.getTime() - admittedAt.getTime()) / (1000 * 60 * 60 * 24)));
      dischargeSummary = "Patient recovered well and was discharged in stable condition with follow-up advised.";
      finalRoomStatus.set(room.id, RoomStatus.AVAILABLE);
      occupiedRoomIds.delete(room.id);
    } else {
      status = Math.random() < 0.9 ? AdmissionStatus.ADMITTED : AdmissionStatus.TRANSFERRED;
      days = Math.max(1, Math.ceil((Date.now() - admittedAt.getTime()) / (1000 * 60 * 60 * 24)));
      finalRoomStatus.set(room.id, RoomStatus.OCCUPIED);
    }

    const admission = await prisma.admission.create({
      data: {
        admissionNumber,
        patientId: patient.id,
        doctorId: doctor.id,
        nurseId: nurse?.id ?? null,
        roomId: room.id,
        admittedBy: pick(ADMITTED_BY_NAMES),
        admittedAt,
        dischargedAt,
        status,
        reason: pick(DIAGNOSES),
        dischargeSummary,
      },
    });
    admissions.push({ id: admission.id, patientId: patient.id, doctorId: doctor.id, roomId: room.id, admittedAt, status, days });
  }

  // Reconcile room statuses with final admission reality
  console.log("Reconciling room statuses...");
  for (const [roomId, status] of finalRoomStatus.entries()) {
    await prisma.room.update({ where: { id: roomId }, data: { status } });
  }

  // ── Invoices ─────────────────────────────────────────────────────────
  console.log("Seeding invoices...");
  const invoiceableAppointments = sample(
    appointments.filter((a) => a.status === AppointmentStatus.COMPLETED),
    Math.min(80, appointments.length)
  );
  const invoiceableAdmissions = sample(admissions, Math.min(80, admissions.length));

  let invoiceSeq = 0;

  async function createInvoiceFromAppointment(apt: AppointmentRec) {
    invoiceSeq++;
    const patient = patients.find((p) => p.id === apt.patientId)!;
    const itemCount = randInt(1, 3);
    const items: { description: string; category: InvoiceItemCategory; quantity: number; unitPrice: number; total: number }[] = [];

    items.push({
      description: "Doctor Consultation Fee",
      category: InvoiceItemCategory.CONSULTATION,
      quantity: 1,
      unitPrice: apt.consultationFee,
      total: apt.consultationFee,
    });
    for (let i = 1; i < itemCount; i++) {
      const category = pick([InvoiceItemCategory.LAB, InvoiceItemCategory.MEDICINE, InvoiceItemCategory.OTHER]);
      const unitPrice = randInt(100, 1500);
      items.push({
        description: category === InvoiceItemCategory.LAB ? "Lab Test" : category === InvoiceItemCategory.MEDICINE ? "Medicine Charges" : "Miscellaneous Charge",
        category,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      });
    }

    await createInvoice({
      invoiceNumber: pad("INV", invoiceSeq, 5),
      patientId: patient.id,
      appointmentId: apt.id,
      admissionId: null,
      issuedAtBase: apt.scheduledAt,
      items,
    });
  }

  async function createInvoiceFromAdmission(adm: AdmissionRec) {
    invoiceSeq++;
    const patient = patients.find((p) => p.id === adm.patientId)!;
    const room = rooms.find((r) => r.id === adm.roomId)!;
    const items: { description: string; category: InvoiceItemCategory; quantity: number; unitPrice: number; total: number }[] = [];

    items.push({
      description: `Room Charges (${room.roomNumber}, ${adm.days} day${adm.days > 1 ? "s" : ""})`,
      category: InvoiceItemCategory.ROOM_CHARGE,
      quantity: adm.days,
      unitPrice: room.ratePerDay,
      total: room.ratePerDay * adm.days,
    });

    const extraCount = randInt(0, 3);
    for (let i = 0; i < extraCount; i++) {
      const category = pick([InvoiceItemCategory.MEDICINE, InvoiceItemCategory.LAB, InvoiceItemCategory.OTHER]);
      const unitPrice = randInt(200, 3000);
      items.push({
        description: category === InvoiceItemCategory.LAB ? "Lab Test" : category === InvoiceItemCategory.MEDICINE ? "Medicine Charges" : "Miscellaneous Charge",
        category,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      });
    }

    await createInvoice({
      invoiceNumber: pad("INV", invoiceSeq, 5),
      patientId: patient.id,
      appointmentId: null,
      admissionId: adm.id,
      issuedAtBase: adm.admittedAt,
      items,
    });
  }

  async function createInvoice(opts: {
    invoiceNumber: string;
    patientId: string;
    appointmentId: string | null;
    admissionId: string | null;
    issuedAtBase: Date;
    items: { description: string; category: InvoiceItemCategory; quantity: number; unitPrice: number; total: number }[];
  }) {
    const subtotal = opts.items.reduce((s, it) => s + it.total, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = Math.random() < 0.15 ? Math.round(subtotal * 0.02 * 100) / 100 : 0;
    const totalAmount = Math.round((subtotal + tax - discount) * 100) / 100;

    const status = pickWeighted([
      { value: InvoiceStatus.PAID, weight: 70 },
      { value: InvoiceStatus.PENDING, weight: 20 },
      { value: InvoiceStatus.PARTIALLY_PAID, weight: 10 },
    ]);

    let paidAmount = 0;
    let paidAt: Date | null = null;
    let paymentMethod: PaymentMethod | null = null;

    if (status === InvoiceStatus.PAID) {
      paidAmount = totalAmount;
      paidAt = addHours(opts.issuedAtBase, randInt(1, 48));
      if (paidAt > new Date()) paidAt = new Date();
      paymentMethod = pick([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI, PaymentMethod.INSURANCE]);
    } else if (status === InvoiceStatus.PARTIALLY_PAID) {
      paidAmount = Math.round(totalAmount * randFloat(0.2, 0.7, 2) * 100) / 100;
      paidAt = addHours(opts.issuedAtBase, randInt(1, 48));
      if (paidAt > new Date()) paidAt = new Date();
      paymentMethod = pick([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI, PaymentMethod.INSURANCE]);
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: opts.invoiceNumber,
        patientId: opts.patientId,
        appointmentId: opts.appointmentId,
        admissionId: opts.admissionId,
        subtotal,
        tax,
        discount,
        totalAmount,
        paidAmount,
        status,
        paymentMethod,
        issuedAt: opts.issuedAtBase,
        paidAt,
      },
    });

    await prisma.$transaction(
      opts.items.map((it) =>
        prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: it.description,
            category: it.category,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
          },
        })
      )
    );

    return invoice;
  }

  for (const apt of invoiceableAppointments) {
    await createInvoiceFromAppointment(apt);
  }
  for (const adm of invoiceableAdmissions) {
    await createInvoiceFromAdmission(adm);
  }

  // Top up to 150 invoices if we fell short (e.g. not enough completed appointments/admissions)
  const remaining = 150 - invoiceSeq;
  if (remaining > 0) {
    const extraAppointments = sample(
      appointments.filter((a) => !invoiceableAppointments.includes(a)),
      remaining
    );
    for (const apt of extraAppointments) {
      await createInvoiceFromAppointment(apt);
    }
  }

  // ── Audit Logs ───────────────────────────────────────────────────────
  console.log("Seeding audit logs...");
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: ["admin@hospital.com", "reception@hospital.com", "doctor1@hospital.com", "doctor2@hospital.com", "nurse1@hospital.com"] } },
  });
  const userByEmail = new Map(demoUsers.map((u) => [u.email, u]));
  const adminUser = userByEmail.get("admin@hospital.com")!;
  const receptionUser = userByEmail.get("reception@hospital.com")!;
  const doctor1User = userByEmail.get("doctor1@hospital.com")!;
  const doctor2User = userByEmail.get("doctor2@hospital.com")!;
  const nurse1User = userByEmail.get("nurse1@hospital.com")!;

  function actorFor(entity: string) {
    if (entity === "Patient" || entity === "Invoice") {
      return pickWeighted([
        { value: receptionUser, weight: 50 },
        { value: adminUser, weight: 30 },
        { value: doctor1User, weight: 10 },
        { value: nurse1User, weight: 10 },
      ]);
    }
    if (entity === "MedicalRecord" || entity === "Prescription") {
      return pickWeighted([
        { value: doctor1User, weight: 45 },
        { value: doctor2User, weight: 45 },
        { value: nurse1User, weight: 10 },
      ]);
    }
    return pickWeighted([
      { value: receptionUser, weight: 40 },
      { value: adminUser, weight: 30 },
      { value: doctor1User, weight: 15 },
      { value: nurse1User, weight: 15 },
    ]);
  }

  const auditSamplePatients = sample(patients, 50);
  const auditSampleAppointments = sample(appointments, 50);
  const auditSampleAdmissions = sample(admissions, 40);
  const auditSampleInvoiceCount = Math.min(50, invoiceSeq);
  const allInvoices = await prisma.invoice.findMany({ select: { id: true, createdAt: true } });
  const auditSampleInvoices = sample(allInvoices, auditSampleInvoiceCount);

  const auditRows: {
    userId: string; userName: string; userRole: Role; action: AuditAction; entity: string; entityId: string; createdAt: Date;
  }[] = [];

  for (const p of auditSamplePatients) {
    const actor = actorFor("Patient");
    auditRows.push({ userId: actor.id, userName: actor.name, userRole: actor.role, action: AuditAction.CREATE, entity: "Patient", entityId: p.id, createdAt: p.registeredAt });
  }
  for (const a of auditSampleAppointments) {
    const actor = actorFor("Appointment");
    auditRows.push({ userId: actor.id, userName: actor.name, userRole: actor.role, action: AuditAction.CREATE, entity: "Appointment", entityId: a.id, createdAt: a.scheduledAt });
  }
  for (const adm of auditSampleAdmissions) {
    const actor = actorFor("Admission");
    auditRows.push({ userId: actor.id, userName: actor.name, userRole: actor.role, action: AuditAction.CREATE, entity: "Admission", entityId: adm.id, createdAt: adm.admittedAt });
  }
  for (const inv of auditSampleInvoices) {
    const actor = actorFor("Invoice");
    auditRows.push({ userId: actor.id, userName: actor.name, userRole: actor.role, action: AuditAction.CREATE, entity: "Invoice", entityId: inv.id, createdAt: inv.createdAt });
  }

  const chunkSize = 75;
  for (let i = 0; i < auditRows.length; i += chunkSize) {
    const chunk = auditRows.slice(i, i + chunkSize);
    await prisma.$transaction(chunk.map((row) => prisma.auditLog.create({ data: row })));
  }

  // ── Summary ──────────────────────────────────────────────────────────
  const counts = {
    HospitalProfile: await prisma.hospitalProfile.count(),
    Department: await prisma.department.count(),
    User: await prisma.user.count(),
    Doctor: await prisma.doctor.count(),
    Nurse: await prisma.nurse.count(),
    Patient: await prisma.patient.count(),
    Room: await prisma.room.count(),
    Appointment: await prisma.appointment.count(),
    MedicalRecord: await prisma.medicalRecord.count(),
    Prescription: await prisma.prescription.count(),
    PrescriptionItem: await prisma.prescriptionItem.count(),
    Admission: await prisma.admission.count(),
    Invoice: await prisma.invoice.count(),
    InvoiceItem: await prisma.invoiceItem.count(),
    AuditLog: await prisma.auditLog.count(),
  };

  console.log("\nSeed complete. Row counts:");
  console.table(counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
