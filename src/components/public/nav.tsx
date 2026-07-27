"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const EMERGENCY_NUMBER = "+91 80 4567 8900";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/departments", label: "Departments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/services", label: "Services" },
  { href: "/health-packages", label: "Health Packages" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        solid
          ? "border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="Niramaya" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-semibold text-foreground">Niramaya</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  active ? "text-primary" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}
            className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
          >
            <Phone className="size-3.5" />
            {EMERGENCY_NUMBER}
          </a>
          <Link
            href="/patient-portal"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Patient Portal
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Staff Portal</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/appointments">Book Appointment</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild size="sm">
            <Link href="/appointments">Book Appointment</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
                <Image src="/logo.png" alt="Niramaya" width={28} height={28} className="rounded-md" />
                <span className="text-sm font-semibold text-foreground">Niramaya</span>
              </div>
              <nav className="flex flex-col gap-1 px-3 py-3">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/patient-portal"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Patient Portal
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Staff Portal
                </Link>
              </nav>
              <div className="mt-auto border-t border-border p-4">
                <a
                  href={`tel:${EMERGENCY_NUMBER.replace(/\s+/g, "")}`}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
                >
                  <Phone className="size-3.5" />
                  Emergency: {EMERGENCY_NUMBER}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
