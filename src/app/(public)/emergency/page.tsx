import { Phone, Ambulance, Clock, MapPin, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EMERGENCY_NUMBER = "+91 80 4567 8900";
const AMBULANCE_NUMBER = "+91 80 4567 8911";

const WHAT_TO_BRING = [
  "A valid government-issued photo ID",
  "Insurance card, if you have one",
  "List of current medications, if available",
  "Known allergies or chronic conditions information",
  "Emergency contact details",
];

export default function EmergencyPage() {
  return (
    <main className="flex-1">
      <section className="bg-destructive/10">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white uppercase">
            Emergency Department — Open 24×7
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Medical Emergency? Call Us Immediately.
          </h1>
          <Card className="mx-auto mt-8 max-w-md border-destructive/30 bg-background">
            <CardContent className="flex flex-col items-center gap-2">
              <Phone className="size-8 text-destructive" />
              <a
                href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}
                className="text-3xl font-bold text-destructive"
              >
                {EMERGENCY_NUMBER}
              </a>
              <p className="text-sm text-muted-foreground">24-Hour Emergency Helpline</p>
            </CardContent>
          </Card>
          <p className="mt-6 text-sm text-muted-foreground sm:text-base">
            In case of a medical emergency, call our 24/7 helpline or proceed directly to our
            Emergency Department. For life-threatening situations, please call an ambulance
            immediately.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg" variant="destructive">
              <a href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}>
                <Phone className="size-4" />
                Call Emergency Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-start gap-3">
              <Ambulance className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ambulance Service</p>
                <a
                  href={`tel:${AMBULANCE_NUMBER.replace(/\s+/g, "")}`}
                  className="text-lg font-bold text-primary"
                >
                  {AMBULANCE_NUMBER}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dedicated dispatch line, available around the clock.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3">
              <Clock className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Emergency Department</p>
                <p className="text-lg font-bold text-foreground">Open 24×7</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every day of the year, including holidays.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">
                  45 MG Road, Bengaluru, Karnataka 560001
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Emergency entrance is clearly marked at the front of the building.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3">
              <FileText className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">What to Bring</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {WHAT_TO_BRING.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
