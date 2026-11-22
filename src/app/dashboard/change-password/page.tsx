import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-md">
      <PageHeader title="Change password" description="You will be signed out and asked to sign in with the new password." />
      <Card>
        <CardContent className="pt-6">
          <ChangePasswordForm forced={session.user.mustChangePassword} />
        </CardContent>
      </Card>
    </div>
  );
}
