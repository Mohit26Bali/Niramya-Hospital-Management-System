import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="size-7 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">Access restricted</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. Contact an administrator if you believe this is a mistake.
      </p>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
