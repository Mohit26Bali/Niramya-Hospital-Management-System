import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Star, GraduationCap, Briefcase, Clock, Languages, Building2, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorCard, type DoctorCardData } from "@/components/public/doctors/doctor-card";
import { doctorAvatarUrl, initials } from "@/lib/utils";

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      department: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!doctor || !doctor.isActive) {
    notFound();
  }

  const relatedDoctors = await prisma.doctor.findMany({
    where: { departmentId: doctor.departmentId, id: { not: doctor.id }, isActive: true },
    take: 3,
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      specialization: true,
      yearsExperience: true,
      isAvailable: true,
      department: { select: { id: true, name: true } },
    },
  });

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const averageRating =
    doctor.reviews.length > 0
      ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) / doctor.reviews.length
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <Card className="border-border shadow-none">
        <CardContent className="flex flex-col items-center gap-6 px-6 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar size="lg" className="size-28">
            <AvatarImage src={doctorAvatarUrl(doctor.employeeCode)} alt={fullName} />
            <AvatarFallback className="text-2xl">{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  doctor.isAvailable
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${doctor.isAvailable ? "bg-emerald-500" : "bg-muted-foreground"}`}
                />
                {doctor.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            <Badge variant="outline" className="mx-auto sm:mx-0 w-fit">
              {doctor.specialization}
            </Badge>
            <Link
              href={`/departments/${doctor.department.id}`}
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              {doctor.department.name} Department
            </Link>
            {averageRating !== null ? (
              <div className="flex items-center justify-center gap-1 sm:justify-start">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({doctor.reviews.length} reviews)
                </span>
              </div>
            ) : null}
            <div className="mt-2">
              <Button asChild>
                <Link href={`/appointments?doctorId=${doctor.id}`}>Book Appointment</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biography */}
      <Card className="mt-6 border-border shadow-none">
        <CardHeader>
          <CardTitle>Biography</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {doctor.bio ?? "Biography coming soon."}
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="mt-6 border-border shadow-none">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow icon={GraduationCap} label="Qualification" value={doctor.qualification} />
            <DetailRow
              icon={Briefcase}
              label="Experience"
              value={`${doctor.yearsExperience} years`}
            />
            <DetailRow icon={Building2} label="Department" value={doctor.department.name} />
            <DetailRow icon={Clock} label="Clinic Timings" value="Mon-Sat, 10 AM - 5 PM" />
            <DetailRow icon={Languages} label="Languages" value="English, Hindi" />
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card className="mt-6 border-border shadow-none">
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {doctor.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {doctor.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{review.patientName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related doctors */}
      {relatedDoctors.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Related Doctors
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDoctors.map((related) => (
              <DoctorCard key={related.id} doctor={related as DoctorCardData} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="size-4.5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
