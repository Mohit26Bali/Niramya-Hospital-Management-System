import Link from "next/link";
import { CalendarPlus, FilePlus, ReceiptText, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const actions = [
    { href: "/dashboard/patients", label: "Register Patient", icon: UserPlus },
    { href: "/dashboard/appointments", label: "Schedule Appointment", icon: CalendarPlus },
    { href: "/dashboard/admissions", label: "Admit Patient", icon: FilePlus },
    { href: "/dashboard/billing", label: "Create Invoice", icon: ReceiptText },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action.href} variant="outline" size="sm" asChild className="gap-1.5">
          <Link href={action.href}>
            <action.icon className="size-3.5" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
