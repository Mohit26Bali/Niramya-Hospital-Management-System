import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { HEALTH_PACKAGES } from "@/content/health-packages";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HealthPackagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Health Checkup Packages
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Preventive screening packages designed for every age and risk profile, bundling the
          tests that matter most into a single convenient visit.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HEALTH_PACKAGES.map((pkg) => (
          <Card key={pkg.slug} className="flex flex-col border-border shadow-none transition-shadow duration-150 hover:shadow-sm">
            <CardContent className="flex-1 p-6">
              <h2 className="text-lg font-semibold text-foreground">{pkg.name}</h2>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                {formatCurrency(pkg.price)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {pkg.duration}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{pkg.description}</p>

              <ul className="mt-4 space-y-2">
                {pkg.inclusions.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {pkg.inclusions.length > 4 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  +{pkg.inclusions.length - 4} more inclusions
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button asChild className="w-full">
                <Link href="/appointments">Book This Package</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
