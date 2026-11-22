import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

// Demo accounts are shown only on a demo site that was seeded with them on purpose. A real deployment never
// lists usernames and passwords on its sign-in page.
const SHOW_DEMO_ACCOUNTS = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ changed?: string; reason?: string }>;
}) {
  const { changed, reason } = await searchParams;
  const notice =
    changed === "1"
      ? "Your password was changed. Sign in with the new password."
      : reason === "ended"
        ? "You were signed out because your account is no longer active or your session ended."
        : null;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3">
            <Image src="/logo.png" alt="Niramaya" width={40} height={40} className="rounded-lg" />
            <div>
              <p className="text-lg font-semibold text-foreground">Niramaya</p>
              <p className="text-xs text-muted-foreground">Compassion. Care. Excellence.</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Hospital Management System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure staff portal</p>

          {notice && (
            <p role="status" className="mt-6 rounded-md border border-border bg-muted/60 p-3 text-sm text-foreground">
              {notice}
            </p>
          )}

          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          {SHOW_DEMO_ACCOUNTS && (
            <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Demo accounts (password: password123)</p>
              <p>admin@hospital.com · doctor1@hospital.com · nurse1@hospital.com · reception@hospital.com</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden items-center justify-center bg-accent lg:flex">
        <Image
          src="/illustrations/login.svg"
          alt=""
          width={480}
          height={480}
          className="h-auto w-3/4 max-w-md"
        />
      </div>
    </div>
  );
}
