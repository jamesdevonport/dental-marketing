"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/creatives", label: "Ad directory" },
  { href: "/creatives/templates", label: "Templates" },
  { href: "/creatives/personas", label: "Personas" },
  { href: "/creatives/topics", label: "Topics" },
];

export function CreativesNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/creatives") {
      // Ad directory is active for /creatives root and creative detail / new pages,
      // but not for the other top-level tabs.
      return !TABS.slice(1).some((t) => pathname.startsWith(t.href));
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="-mb-px flex gap-5 text-sm">
      {TABS.map((t) => {
        const active = isActive(t.href);
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
