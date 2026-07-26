"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { visibleNavItems } from "@/components/layout/nav-items";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = visibleNavItems(role);

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex print:hidden">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Image src="/logo.png" alt="Niramaya" width={28} height={28} className="rounded-md" />
        <span className="text-sm font-semibold text-white">Niramaya</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3 text-[11px] text-sidebar-foreground/60">
        Niramaya HMS · v1.0
      </div>
    </aside>
  );
}
