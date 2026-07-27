import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMERGENCY_NUMBER = "+91 80 4567 8900";

const TRUST_INDICATORS = [
  "12 Specialist Doctors",
  "24×7 Emergency",
  "50 Bed Facility",
  "NABH Inspired Standards",
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-background"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 15% 0%, var(--accent), transparent 60%)",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Multi-Specialty Hospital
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Advanced Healthcare. Rooted in Compassion.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Niramaya brings together expert specialists, modern diagnostic technology, and
            round-the-clock emergency care to support you and your family at every stage of
            health.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="px-8 py-6 text-base">
              <Link href="/appointments">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-6 text-base">
              <a href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}>
                <Phone className="size-4" />
                Call Emergency: {EMERGENCY_NUMBER}
              </a>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {TRUST_INDICATORS.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center">
          <Image
            src="/illustrations/hospital-hero.svg"
            alt="Illustration of Niramaya Hospital with an ambulance and medical cross"
            width={560}
            height={520}
            priority
            className="h-auto w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>

      <div className="hidden justify-center pb-6 sm:flex">
        <a
          href="#departments"
          className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Explore
          <ChevronDown className="size-4" />
        </a>
      </div>
    </section>
  );
}
