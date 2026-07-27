import {
  BedDouble,
  Pill,
  FlaskConical,
  Ambulance,
  UtensilsCrossed,
  Wifi,
  Accessibility,
  ParkingSquare,
} from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";

const FACILITIES = [
  { icon: BedDouble, label: "Modern ICU" },
  { icon: Pill, label: "24/7 Pharmacy" },
  { icon: FlaskConical, label: "Diagnostic Lab" },
  { icon: Ambulance, label: "Ambulance Service" },
  { icon: UtensilsCrossed, label: "Cafeteria" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Accessibility, label: "Wheelchair Access" },
  { icon: ParkingSquare, label: "Parking" },
];

export function FacilitiesSection() {
  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Infrastructure"
          title="Hospital Facilities"
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FACILITIES.map((facility) => (
            <div
              key={facility.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-5 text-center"
            >
              <facility.icon className="size-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{facility.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
