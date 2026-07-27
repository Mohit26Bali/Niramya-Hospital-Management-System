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
    <section className="relative flex min-h-[560px] items-center overflow-hidden sm:min-h-[620px] lg:min-h-[720px]">
      <Image
        src="/bg.png"
        alt="Niramaya Hospital main entrance at sunset, with an ambulance in the driveway"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Scrim: dark on the left where text sits, fading out toward the building on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(6,15,15,0.82) 0%, rgba(6,15,15,0.62) 38%, rgba(6,15,15,0.28) 65%, rgba(6,15,15,0.05) 85%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(6,15,15,0.55) 0%, transparent 35%)" }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <span className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
          Multi-Specialty Hospital
        </span>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Advanced Healthcare. Rooted in Compassion.
        </h1>
        <p className="max-w-xl text-base text-white/85 sm:text-lg">
          Niramaya brings together expert specialists, modern diagnostic technology, and
          round-the-clock emergency care to support you and your family at every stage of health.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="px-8 py-6 text-base">
            <Link href="/appointments">Book Appointment</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-white/10 px-8 py-6 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
          >
            <a href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}>
              <Phone className="size-4" />
              Call Emergency: {EMERGENCY_NUMBER}
            </a>
          </Button>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
          {TRUST_INDICATORS.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-sm text-white/85">
              <ShieldCheck className="size-4 text-emerald-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
        <a
          href="#departments"
          className="flex flex-col items-center gap-1 text-xs font-medium text-white/80 transition-colors hover:text-white"
        >
          Explore
          <ChevronDown className="size-4" />
        </a>
      </div>
    </section>
  );
}
