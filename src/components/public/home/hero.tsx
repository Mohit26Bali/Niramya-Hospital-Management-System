import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMERGENCY_NUMBER = "+91 80 4567 8900";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-accent">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Multi-Specialty Hospital
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Advanced Healthcare. Compassionate Hearts.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Niramaya brings together expert specialists, modern diagnostic technology, and
            round-the-clock emergency care to support you and your family at every stage of
            health.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/appointments">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}>
                <Phone className="size-4" />
                Call Emergency: {EMERGENCY_NUMBER}
              </a>
            </Button>
          </div>
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
    </section>
  );
}
