import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";
import { ContactForm } from "@/components/public/contact-form";

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="bg-accent">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Get In Touch
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We&apos;re Here to Help
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Reach out with questions about appointments, services, or anything else — our team
            will get back to you promptly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Contact Info" title="Reach Niramaya Hospital" />
            <div className="flex flex-col gap-4">
              <Card>
                <CardContent className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">
                      45 MG Road, Bengaluru, Karnataka 560001
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Emergency</p>
                    <p className="text-sm text-muted-foreground">+91 80 4567 8900 (24×7)</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">General Enquiries</p>
                    <p className="text-sm text-muted-foreground">+91 80 2345 6789</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">care@niramayahospital.in</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Working Hours</p>
                    <p className="text-sm text-muted-foreground">OPD: Mon-Sat, 9 AM - 8 PM</p>
                    <p className="text-sm text-muted-foreground">Emergency: 24/7, all days</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted text-center">
              <MapPin className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Map view coming soon</p>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Send a Message" title="Contact Form" />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
