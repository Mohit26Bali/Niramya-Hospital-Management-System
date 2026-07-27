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
  type LucideIcon,
} from "lucide-react";
import type { Department } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";

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

export function DepartmentsSection({ departments }: { departments: Department[] }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Treat"
          title="Our Departments"
          description="Comprehensive, specialty-led care across every major discipline, backed by experienced clinicians and modern diagnostics."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => {
            const Icon = DEPARTMENT_ICONS[dept.name] ?? Stethoscope;
            return (
              <Link key={dept.id} href="/departments">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{dept.name}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {dept.description ?? "Specialized care from our experienced clinical team."}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
