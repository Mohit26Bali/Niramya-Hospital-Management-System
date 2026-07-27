import Link from "next/link";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientPortalPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
        <UserCircle className="size-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Patient Portal
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        Track your appointments, prescriptions, and medical records online. Coming soon.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to Home</Link>
      </Button>
    </main>
  );
}
