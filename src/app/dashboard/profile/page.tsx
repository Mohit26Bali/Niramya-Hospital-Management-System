import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, email, role } = session.user;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Your account details" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-lg font-medium text-primary-foreground">
              {initials(name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <Badge variant="secondary" className="mt-2">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard/change-password">Change password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
