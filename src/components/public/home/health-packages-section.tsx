import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/public/section-heading";

const PACKAGES = [
  {
    name: "Master Health Checkup",
    price: "₹4,999",
    description: "A comprehensive full-body screening covering 60+ health parameters.",
  },
  {
    name: "Cardiac Package",
    price: "₹7,999",
    description: "Complete heart health screening including ECG, echo, and lipid profile.",
  },
  {
    name: "Women's Wellness",
    price: "₹5,499",
    description: "Screenings tailored to women's health at every life stage.",
  },
  {
    name: "Senior Citizen Checkup",
    price: "₹6,499",
    description: "Focused screening for age-related conditions and chronic disease risk.",
  },
];

export function HealthPackagesSection() {
  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Preventive Care"
          title="Health Packages"
          description="Convenient, affordable screening packages designed around your needs."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.name} className="h-full">
              <CardContent className="flex flex-col gap-3">
                <ClipboardCheck className="size-6 text-primary" />
                <h3 className="text-base font-semibold text-foreground">{pkg.name}</h3>
                <p className="text-xl font-bold text-primary">{pkg.price}</p>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/health-packages">View All Packages</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
