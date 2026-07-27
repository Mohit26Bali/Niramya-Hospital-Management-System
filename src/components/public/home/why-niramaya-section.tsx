import { GraduationCap, Cpu, Siren, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";

const REASONS = [
  {
    icon: GraduationCap,
    title: "Experienced Specialists",
    description: "Our clinicians bring years of focused expertise across every specialty.",
  },
  {
    icon: Cpu,
    title: "Advanced Technology",
    description: "Modern diagnostic and treatment equipment for faster, more accurate care.",
  },
  {
    icon: Siren,
    title: "24×7 Emergency Care",
    description: "A dedicated emergency team ready to respond any hour of the day.",
  },
  {
    icon: HeartHandshake,
    title: "Compassionate Patient Care",
    description: "We treat every patient with dignity, empathy, and personal attention.",
  },
];

export function WhyNiramayaSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Promise"
          title="Why Niramaya?"
          description="Here's what sets our care apart, every single visit."
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <Card key={reason.title} className="h-full">
              <CardContent className="flex flex-col items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <reason.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{reason.title}</h3>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
