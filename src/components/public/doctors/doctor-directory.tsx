"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorCard, type DoctorCardData } from "@/components/public/doctors/doctor-card";

export function DoctorDirectory({ doctors }: { doctors: DoctorCardData[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("all");

  const departments = useMemo(() => {
    const names = new Set(doctors.map((d) => d.department.name));
    return Array.from(names).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesDepartment = department === "all" || doctor.department.name === department;
      if (!matchesDepartment) return false;
      if (!query) return true;
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      return (
        fullName.includes(query) || doctor.specialization.toLowerCase().includes(query)
      );
    });
  }, [doctors, search, department]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No doctors match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
