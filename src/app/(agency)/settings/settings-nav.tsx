"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/integrations", label: "Integrations" },
  { href: "/settings/agent", label: "Agent" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/api-keys", label: "API keys" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-5 text-sm overflow-x-auto">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap border-b-2 py-2.5",
              active
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
