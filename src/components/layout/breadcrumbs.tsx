"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  clientById,
  campaignById,
  creativeById,
  topicById,
} from "@/lib/fixtures";

const STATIC_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  agent: "Agent",
  clients: "Clients",
  new: "New",
  campaigns: "Campaigns",
  creatives: "Creatives",
  templates: "Templates",
  personas: "Personas",
  topics: "Topics",
  reports: "Reports",
  settings: "Settings",
  account: "Account",
  team: "Team",
  billing: "Billing",
  integrations: "Integrations",
  notifications: "Notifications",
  "api-keys": "API keys",
  overview: "Overview",
  brand: "Brand",
  connections: "Connections",
  portal: "Client portal",
  performance: "Performance",
  approvals: "Approvals",
};

function labelFor(segment: string, index: number, all: string[]): string {
  if (clientById[segment]) return clientById[segment].name;
  if (campaignById[segment]) return campaignById[segment].name;
  if (creativeById[segment]) {
    const c = creativeById[segment];
    return c.copy.headlines[0] ?? c.name;
  }
  if (topicById[segment]) return topicById[segment].name;
  if (STATIC_LABELS[segment]) return STATIC_LABELS[segment];
  return segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="h-3 w-3 opacity-50" /> : null}
            {isLast ? (
              <span className="text-foreground">{labelFor(seg, i, segments)}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {labelFor(seg, i, segments)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
