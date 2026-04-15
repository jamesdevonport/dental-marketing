"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "overview", label: "Overview" },
  { slug: "brand", label: "Brand" },
  { slug: "campaigns", label: "Campaigns" },
  { slug: "creatives", label: "Creatives" },
  { slug: "connections", label: "Connections" },
  { slug: "settings", label: "Settings" },
];

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-5 text-sm">
      {TABS.map((t) => {
        const href = `/clients/${clientId}/${t.slug}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={t.slug}
            href={href}
            className={cn(
              "border-b-2 py-2.5",
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
