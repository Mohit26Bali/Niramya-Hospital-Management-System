import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  Siren,
  ScanLine,
  FlaskConical,
  Scissors,
  HeartPulse,
  Baby,
  PersonStanding,
  Activity,
  Pill,
  Ambulance,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Service = {
  name: string;
  description: string;
  icon: LucideIcon;
};

const SERVICES: Service[] = [
  {
    name: "OPD Consultations",
    description:
      "Walk-in and scheduled consultations across general medicine and every major specialty.",
    icon: Stethoscope,
  },
  {
    name: "Emergency & Trauma Care",
    description: "Round-the-clock emergency care staffed by trauma-trained doctors and nurses.",
    icon: Siren,
  },
  {
    name: "Diagnostic Imaging",
    description: "On-site X-Ray, CT, MRI, and ultrasound for fast, accurate diagnosis.",
    icon: ScanLine,
  },
  {
    name: "Laboratory Services",
    description: "Full-service pathology lab covering blood work, biopsies, and rapid testing.",
    icon: FlaskConical,
  },
  {
    name: "Surgical Services",
    description: "Modern operation theatres supporting general, laparoscopic, and specialty surgery.",
    icon: Scissors,
  },
  {
    name: "ICU & Critical Care",
    description: "Continuous monitoring and specialist-led care for critically ill patients.",
    icon: HeartPulse,
  },
  {
    name: "Maternity & Delivery",
    description: "Comprehensive prenatal, delivery, and postnatal care in a dedicated maternity wing.",
    icon: Baby,
  },
  {
    name: "Pediatric Care",
    description: "Specialized care for infants, children, and adolescents from birth through adolescence.",
    icon: PersonStanding,
  },
  {
    name: "Physiotherapy & Rehabilitation",
    description: "Personalized rehabilitation programs for injury recovery and mobility restoration.",
    icon: Activity,
  },
  {
    name: "Pharmacy Services",
    description: "In-house pharmacy stocking prescription medication with pharmacist guidance.",
    icon: Pill,
  },
  {
    name: "Ambulance Services",
    description: "24/7 ambulance dispatch equipped for emergency transport and on-route care.",
    icon: Ambulance,
  },
  {
    name: "Health Checkup Packages",
    description: "Preventive screening packages tailored to different ages and risk profiles.",
    icon: ClipboardCheck,
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Our Medical Services
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Comprehensive, compassionate care delivered by experienced specialists and supported by
          modern facilities — from routine consultations to critical care.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const isPackages = service.name === "Health Checkup Packages";
          const card = (
            <Card
              className={`h-full border-border shadow-none transition-shadow duration-150 hover:shadow-sm ${isPackages ? "hover:border-primary/40" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                  <service.icon className="size-5 text-primary" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">{service.name}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{service.description}</p>
                {isPackages ? (
                  <p className="mt-2 text-sm font-medium text-primary">View packages →</p>
                ) : null}
              </CardContent>
            </Card>
          );
          return isPackages ? (
            <Link key={service.name} href="/health-packages">
              {card}
            </Link>
          ) : (
            <div key={service.name}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
