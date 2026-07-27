import { Stethoscope, Building2, Users, Clock } from "lucide-react";

export function StatsSection({
  doctorCount,
  departmentCount,
  patientCount,
}: {
  doctorCount: number;
  departmentCount: number;
  patientCount: number;
}) {
  const stats = [
    {
      icon: Stethoscope,
      value: `${doctorCount}+`,
      label: "Expert Doctors",
    },
    {
      icon: Building2,
      value: `${departmentCount}`,
      label: "Specialty Departments",
    },
    {
      icon: Users,
      value: patientCount >= 1000 ? `${Math.floor(patientCount / 100) * 100}+` : `${patientCount}+`,
      label: "Patients Served",
    },
    {
      icon: Clock,
      value: "15+",
      label: "Years of Care",
    },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                <stat.icon className="size-5" />
              </div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
