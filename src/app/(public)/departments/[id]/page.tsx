import { notFound } from "next/navigation";
import {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  UserRound,
  Ear,
  Sparkles,
  Building2,
  Phone,
  Layers,
  Stethoscope as EquipmentIcon,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorCard, type DoctorCardData } from "@/components/public/doctors/doctor-card";

const DEPARTMENT_ICONS: Record<string, LucideIcon> = {
  Cardiology: HeartPulse,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  "General Medicine": Stethoscope,
  Gynecology: UserRound,
  ENT: Ear,
  Dermatology: Sparkles,
};

const COMMON_CONDITIONS: Record<string, string[]> = {
  Cardiology: ["Hypertension", "Coronary Artery Disease", "Arrhythmia", "Heart Failure", "Valvular Heart Disease"],
  Neurology: ["Stroke", "Epilepsy", "Migraine", "Parkinson's Disease", "Peripheral Neuropathy"],
  Orthopedics: ["Fractures", "Osteoarthritis", "Sports Injuries", "Spine Disorders", "Ligament Tears"],
  Pediatrics: ["Childhood Infections", "Growth Disorders", "Vaccinations", "Asthma in Children", "Nutritional Deficiencies"],
  "General Medicine": ["Diabetes", "Hypertension", "Viral Infections", "Thyroid Disorders", "Respiratory Illness"],
  Gynecology: ["Pregnancy Care", "Menstrual Disorders", "PCOS", "Infertility", "Menopause Management"],
  ENT: ["Sinusitis", "Hearing Loss", "Tonsillitis", "Vertigo", "Allergic Rhinitis"],
  Dermatology: ["Acne", "Eczema", "Psoriasis", "Hair Loss", "Skin Allergies"],
};

const FACILITIES = [
  "Advanced diagnostic equipment",
  "Dedicated nursing staff",
  "24/7 department coverage",
  "On-site pharmacy access",
];

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      doctors: {
        where: { isActive: true },
        orderBy: { lastName: "asc" },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          specialization: true,
          yearsExperience: true,
          isAvailable: true,
          departmentId: true,
        },
      },
    },
  });

  if (!department || !department.isActive) {
    notFound();
  }

  const Icon = DEPARTMENT_ICONS[department.name] ?? Building2;
  const conditions = COMMON_CONDITIONS[department.name] ?? [
    "General consultations",
    "Diagnostic evaluation",
    "Preventive care",
    "Follow-up treatment",
  ];

  const doctorsForCards: DoctorCardData[] = department.doctors.map((d) => ({
    ...d,
    department: { id: department.id, name: department.name },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <Card className="border-border shadow-none">
        <CardContent className="flex flex-col items-start gap-4 px-6 sm:flex-row sm:items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Icon className="size-6 text-primary" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {department.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {department.description ?? "Specialized care and treatment."}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-4" /> Floor {department.floor}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="size-4" /> {department.phone}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle>Common Conditions Treated</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {conditions.map((condition) => (
                <li key={condition} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {condition}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader>
            <CardTitle>Facilities & Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {FACILITIES.map((facility) => (
                <li key={facility} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EquipmentIcon className="size-4 shrink-0 text-primary" />
                  {facility}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Doctors */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Doctors in {department.name}
        </h2>
        {doctorsForCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doctors currently listed in this department.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctorsForCards.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
