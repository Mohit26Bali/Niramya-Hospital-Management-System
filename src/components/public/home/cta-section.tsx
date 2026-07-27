import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-primary">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
          Ready to experience better healthcare?
        </h2>
        <p className="max-w-xl text-sm text-primary-foreground/80 sm:text-base">
          Book an appointment with one of our specialists today and take the first step towards
          better health.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/appointments">Book Appointment</Link>
        </Button>
      </div>
    </section>
  );
}
