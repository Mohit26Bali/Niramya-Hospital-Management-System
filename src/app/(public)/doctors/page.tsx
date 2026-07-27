import { prisma } from "@/lib/prisma";
import { DoctorDirectory } from "@/components/public/doctors/doctor-directory";

export const metadata = {
  title: "Our Doctors | Niramaya Hospital",
  description: "Browse our team of experienced doctors across all specializations.",
};

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      specialization: true,
      qualification: true,
      yearsExperience: true,
      isAvailable: true,
      department: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Our Doctors</h1>
        <p className="text-muted-foreground">
          Meet our team of experienced, board-certified doctors dedicated to your care.
        </p>
      </div>

      <DoctorDirectory doctors={doctors} />
    </div>
  );
}
