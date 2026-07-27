import Link from "next/link";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import type { Doctor, Department } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/public/section-heading";
import { doctorAvatarUrl } from "@/lib/utils";

type DoctorWithDepartment = Doctor & { department: Department };

export function FeaturedDoctorsSection({ doctors }: { doctors: DoctorWithDepartment[] }) {
  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Meet Our Team"
          title="Featured Doctors"
          description="Experienced specialists dedicated to giving you personal, evidence-based care."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="h-full">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={doctorAvatarUrl(doctor.employeeCode)}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  width={72}
                  height={72}
                  className="rounded-full border border-border"
                  unoptimized
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-primary">{doctor.specialization}</p>
                  <p className="text-xs text-muted-foreground">{doctor.department.name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="size-3.5" />
                  {doctor.yearsExperience}+ years experience
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
