"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { changePasswordAction } from "@/actions/password.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword: String(form.get("newPassword") ?? ""),
        confirmPassword: String(form.get("confirmPassword") ?? ""),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {forced && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          Your account was created with a temporary password. Choose your own password to continue.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />
        <p className="text-xs text-muted-foreground">At least 10 characters, with letters and numbers.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repeat new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}
