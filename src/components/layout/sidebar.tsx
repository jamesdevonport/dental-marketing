"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Building2,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { agentProposals } from "@/lib/fixtures";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

const mainItems: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/agent",
    label: "Agent",
    icon: Bot,
    badge: agentProposals.filter((p) => p.status === "pending").length,
  },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/creatives", label: "Creatives", icon: Sparkles },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const footerItems: Item[] = [
  { href: "/settings/account", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    if (href.startsWith("/settings")) return pathname.startsWith("/settings");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold tracking-tight">
            DM
          </div>
          <span className="text-sm font-semibold tracking-tight">Dental Marketing</span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {mainItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </ul>
        <div className="my-3 border-t" />
        <ul className="space-y-0.5">
          {footerItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </ul>
      </nav>
      <div className="border-t p-3 text-[11px] text-muted-foreground">
        Wireframe build · not for production
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
            {item.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
