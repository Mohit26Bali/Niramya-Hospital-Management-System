import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { doctorAvatarUrl, initials } from "@/lib/utils";

export type DoctorCardData = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  yearsExperience: number;
  isAvailable: boolean;
  department: { id: string; name: string };
};

export function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  return (
    <Card className="border-border shadow-none transition-shadow duration-150 hover:shadow-sm">
      <CardContent className="flex flex-col items-center gap-3 px-6 text-center">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={doctorAvatarUrl(doctor.employeeCode)} alt={fullName} />
          <AvatarFallback>{initials(fullName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">{fullName}</p>
          <Badge variant="outline" className="mx-auto">
            {doctor.specialization}
          </Badge>
          <p className="text-sm text-muted-foreground">{doctor.department.name}</p>
          <p className="text-xs text-muted-foreground">
            {doctor.yearsExperience} years experience
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`size-2 rounded-full ${doctor.isAvailable ? "bg-emerald-500" : "bg-muted-foreground"}`}
          />
          <span className={doctor.isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        <Link
          href={`/doctors/${doctor.id}`}
          className="mt-1 inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Profile
        </Link>
      </CardContent>
    </Card>
  );
}
