import Image from "next/image";
import { CalendarDays, Droplet, Syringe, Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";

const EVENTS = [
  {
    image: "/events/diabetes.png",
    icon: Droplet,
    title: "Free Diabetes Camp",
    date: "March 15",
    description: "Complimentary blood sugar screening and consultation with our specialists.",
  },
  {
    image: "/events/blood-donation.png",
    icon: Droplet,
    title: "Blood Donation Drive",
    date: "April 2",
    description: "Join us in supporting patients in need — every donation counts.",
  },
  {
    image: "/events/vaccine.png",
    icon: Syringe,
    title: "Vaccination Week",
    date: "Ongoing",
    description: "Routine and seasonal vaccinations available for all age groups.",
  },
  {
    image: "/events/women.png",
    icon: Mic,
    title: "Women's Health Seminar",
    date: "May 10",
    description: "An open seminar on preventive care and wellness for women.",
  },
];

export function NewsEventsSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community"
          title="News & Events"
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((event) => (
            <Card key={event.title} className="h-full overflow-hidden py-0">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-col gap-3 py-5">
                <event.icon className="size-6 text-primary" />
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {event.date}
                </div>
                <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
