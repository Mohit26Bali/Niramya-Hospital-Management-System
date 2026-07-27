import Image from "next/image";
import { Target, Eye, ShieldCheck, Award, Leaf, BedDouble, Syringe, HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";
import { doctorAvatarUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const LEADERSHIP = [
  { name: "Dr. Anil Kapoor", title: "Chief Medical Officer" },
  { name: "Dr. Shalini Verma", title: "Medical Superintendent" },
  { name: "Ramesh Chandran", title: "Chief Operating Officer" },
  { name: "Dr. Nandita Rao", title: "Head of Nursing Services" },
];

const ACCREDITATIONS = [
  { icon: ShieldCheck, label: "NABH Accredited" },
  { icon: Award, label: "ISO 9001:2015 Certified" },
  { icon: Leaf, label: "Green OT Certified" },
  { icon: ShieldCheck, label: "NABL Accredited Lab" },
];

const MILESTONES = [
  { year: "2010", event: "Niramaya founded with 50 beds and a single OPD block." },
  { year: "2014", event: "Dedicated Cardiology wing opened with a state-of-the-art cath lab." },
  { year: "2019", event: "Expanded to a 150-bed multi-specialty facility." },
  { year: "2022", event: "Launched 24×7 Emergency and Trauma Center." },
  { year: "2023", event: "Digital health records and online appointment booking launched." },
];

export default async function AboutPage() {
  const [bedCount, icuCount] = await Promise.all([
    prisma.room.count({ where: { isActive: true } }),
    prisma.room.count({ where: { isActive: true, type: "ICU" } }),
  ]);

  return (
    <main className="flex-1">
      <section className="bg-accent">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            About Niramaya
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Care Rooted in Compassion, Backed by Expertise
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Niramaya Hospital has been a trusted name in multi-specialty healthcare, combining
            experienced clinicians with modern medical technology.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Our Story" title="A Journey of Care" />
            <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Niramaya Hospital was founded with a simple belief: that quality healthcare should
                be both advanced and deeply personal. What began as a modest 50-bed facility has
                grown into a comprehensive multi-specialty hospital serving thousands of families
                across the region.
              </p>
              <p>
                Over the years, we have invested continuously in specialist talent, modern
                diagnostic equipment, and patient-centered processes — all while holding on to the
                core value that brought us here: treating every patient like family.
              </p>
              <p>
                Today, Niramaya is home to expert teams across cardiology, neurology, orthopedics,
                pediatrics, and more, supported by a 24×7 emergency department and a
                state-of-the-art infrastructure built for both routine and critical care.
              </p>
            </div>
          </div>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
            <Image
              src="/team.png"
              alt="Niramaya doctors, nurses, and staff in a hospital corridor"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-background text-primary">
                  <Target className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To deliver accessible, advanced, and compassionate healthcare that improves the
                  lives of every patient and family we serve.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-background text-primary">
                  <Eye className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  To be the region&apos;s most trusted healthcare institution, recognized for clinical
                  excellence and genuine patient care.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Leadership" title="Meet Our Leadership" align="center" className="mx-auto" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERSHIP.map((leader) => (
            <Card key={leader.name}>
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={doctorAvatarUrl(leader.name)}
                  alt={leader.name}
                  width={72}
                  height={72}
                  className="rounded-full border border-border"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{leader.name}</p>
                  <p className="text-xs text-muted-foreground">{leader.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Recognition"
            title="Accreditations & Certifications"
            align="center"
            className="mx-auto"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ACCREDITATIONS.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-5 text-center"
              >
                <item.icon className="size-6 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Our History" title="Milestones" align="center" className="mx-auto" />
        <ol className="mt-10 flex flex-col gap-6 border-l-2 border-border pl-6">
          {MILESTONES.map((milestone) => (
            <li key={milestone.year} className="relative">
              <span className="absolute top-1 -left-[31px] size-3 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-primary">{milestone.year}</p>
              <p className="text-sm text-muted-foreground">{milestone.event}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-accent">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Infrastructure"
            title="Built for Every Level of Care"
            description="From routine consultations to critical care, our infrastructure is designed to support the full spectrum of patient needs."
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-5">
              <BedDouble className="size-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">{bedCount}+</p>
                <p className="text-xs text-muted-foreground">Beds</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-5">
              <Syringe className="size-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">6</p>
                <p className="text-xs text-muted-foreground">Operation Theatres</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-5">
              <HeartPulse className="size-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">{icuCount}+</p>
                <p className="text-xs text-muted-foreground">ICU Beds</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
