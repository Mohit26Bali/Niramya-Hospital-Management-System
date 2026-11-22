import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // The login token lasts hours; the database is the truth about whether this person may still be here.
  const live = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true, name: true, email: true },
  });
  if (!live || !live.isActive) redirect("/api/end-session");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={live.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: live.name, email: live.email, role: live.role }} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
