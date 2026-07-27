import Link from "next/link";
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
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Departments | Niramaya Hospital",
  description: "Explore our specialized departments and the doctors who lead them.",
};

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

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: { _count: { select: { doctors: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Departments</h1>
        <p className="text-muted-foreground">
          Explore our specialized departments, each staffed by experienced doctors.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const Icon = DEPARTMENT_ICONS[dept.name] ?? Building2;
          return (
            <Link key={dept.id} href={`/departments/${dept.id}`}>
              <Card className="h-full border-border shadow-none transition-shadow duration-150 hover:shadow-sm">
                <CardContent className="flex flex-col gap-3 px-6">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{dept.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dept.description ?? "Specialized care and treatment."}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {dept._count.doctors} {dept._count.doctors === 1 ? "doctor" : "doctors"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
