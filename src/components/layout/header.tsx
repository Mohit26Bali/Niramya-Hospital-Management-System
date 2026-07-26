import type { Role } from "@prisma/client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Header({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <MobileSidebar role={user.role} />

      <div className="hidden lg:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
        <NotificationsBell />
        <ThemeToggle />
        <UserNav name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
