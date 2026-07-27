import Link from "next/link";
import Image from "next/image";
import { Globe, MessageCircle, Camera, Share2, Phone, Mail, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { href: "/about", label: "About" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/services", label: "Services" },
  { href: "/health-packages", label: "Health Packages" },
  { href: "/contact", label: "Contact" },
];

const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General Medicine",
  "Gynecology",
  "ENT",
  "Dermatology",
];

const SOCIALS = [
  { icon: Globe, label: "Website" },
  { icon: MessageCircle, label: "Twitter" },
  { icon: Camera, label: "Instagram" },
  { icon: Share2, label: "LinkedIn" },
];

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Niramaya" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-semibold text-foreground">Niramaya</span>
            </div>
            <p className="text-sm font-medium text-primary">Compassion. Care. Excellence.</p>
            <p className="text-sm text-muted-foreground">
              A multi-specialty hospital dedicated to delivering advanced, patient-first
              healthcare with modern facilities and experienced specialists.
            </p>
            <div className="mt-2 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Departments</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {DEPARTMENTS.map((dept) => (
                <li key={dept}>
                  <Link
                    href="/departments"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {dept}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Emergency & Contact</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm text-destructive">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <span className="font-semibold">+91 80 4567 8900 (Emergency)</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <span>+91 80 2345 6789</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <span>care@niramayahospital.in</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>45 MG Road, Bengaluru, Karnataka 560001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Niramaya Hospital. All rights reserved.
          </p>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-primary">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
