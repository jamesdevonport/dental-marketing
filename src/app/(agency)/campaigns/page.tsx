import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { campaigns, clientById } from "@/lib/fixtures";
import type { Campaign } from "@/lib/fixtures";
import { gbp, num, pct, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Campaigns" };

type Platform = "all" | "meta" | "google";
type StatusFilter = "all" | "active" | "paused" | "draft";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const platform: Platform =
    sp.platform === "google" || sp.platform === "all" ? sp.platform : "meta";
  const status: StatusFilter =
    sp.status === "active" ||
    sp.status === "paused" ||
    sp.status === "draft" ||
    sp.status === "all"
      ? sp.status
      : "active";

  const filtered = campaigns
    .filter((c) => (platform === "all" ? true : c.platform === platform))
    .filter((c) => (status === "all" ? true : c.status === status));

  const counts = {
    platform: {
      all: campaigns.length,
      meta: campaigns.filter((c) => c.platform === "meta").length,
      google: campaigns.filter((c) => c.platform === "google").length,
    },
    status: {
      all: campaigns.filter((c) => (platform === "all" ? true : c.platform === platform)).length,
      active: campaigns.filter(
        (c) => (platform === "all" ? true : c.platform === platform) && c.status === "active",
      ).length,
      paused: campaigns.filter(
        (c) => (platform === "all" ? true : c.platform === platform) && c.status === "paused",
      ).length,
      draft: campaigns.filter(
        (c) => (platform === "all" ? true : c.platform === platform) && c.status === "draft",
      ).length,
    },
  };

  // Aggregate summary
  const summary = filtered.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend7d,
      leads: acc.leads + c.leads7d,
    }),
    { spend: 0, leads: 0 },
  );
  const avgCpl = summary.leads > 0 ? summary.spend / summary.leads : 0;

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="All Meta and Google campaigns across your book."
        actions={
          <Button size="sm" asChild>
            <Link href="/campaigns/new">
              <Plus className="h-3.5 w-3.5" />
              New campaign
            </Link>
          </Button>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        {/* Platform tabs */}
        <div className="flex gap-1 border-b -mb-px">
          <PlatformTab label="Meta" count={counts.platform.meta} platform="meta" current={platform} status={status} />
          <PlatformTab label="Google" count={counts.platform.google} platform="google" current={platform} status={status} />
          <PlatformTab label="All" count={counts.platform.all} platform="all" current={platform} status={status} />
        </div>

        {/* Status filter pills + summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusPill label="Active" count={counts.status.active} status="active" current={status} platform={platform} />
            <StatusPill label="Paused" count={counts.status.paused} status="paused" current={status} platform={platform} />
            <StatusPill label="Draft" count={counts.status.draft} status="draft" current={status} platform={platform} />
            <StatusPill label="All" count={counts.status.all} status="all" current={status} platform={platform} />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
            <span>
              <span className="text-foreground font-medium">{filtered.length}</span> campaigns
            </span>
            <span>
              Spend 7d <span className="text-foreground font-medium">{gbp(summary.spend)}</span>
            </span>
            <span>
              Leads 7d <span className="text-foreground font-medium">{num(summary.leads)}</span>
            </span>
            <span>
              Avg CPL <span className="text-foreground font-medium">{summary.leads > 0 ? gbp(avgCpl, true) : "—"}</span>
            </span>
          </div>
        </div>

        <Card className="p-0">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No campaigns match these filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <Th className="pl-4">Campaign</Th>
                      <Th>Client</Th>
                      <Th>Status</Th>
                      <Th>Objective</Th>
                      <Th className="text-right">Budget</Th>
                      <Th className="text-right">Spend 7d</Th>
                      <Th className="text-right">Leads 7d</Th>
                      <Th className="text-right">CPL</Th>
                      <Th className="text-right">CTR</Th>
                      <Th>Updated</Th>
                      <Th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <CampaignRow key={c.id} campaign={c} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PlatformTab({
  label,
  count,
  platform,
  current,
  status,
}: {
  label: string;
  count: number;
  platform: Platform;
  current: Platform;
  status: StatusFilter;
}) {
  const href = `/campaigns?platform=${platform}${status !== "active" ? `&status=${status}` : ""}`;
  const active = current === platform;
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 px-3 py-2 text-sm",
        active
          ? "border-primary text-foreground font-medium"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
        {count}
      </span>
    </Link>
  );
}

function StatusPill({
  label,
  count,
  status,
  current,
  platform,
}: {
  label: string;
  count: number;
  status: StatusFilter;
  current: StatusFilter;
  platform: Platform;
}) {
  const active = current === status;
  const href = `/campaigns?platform=${platform}${status !== "active" ? `&status=${status}` : ""}`;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:bg-muted",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1 text-[10px] tabular-nums",
          active ? "bg-background/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const client = clientById[campaign.clientId];
  const adsCount = campaign.adSets.reduce((s, a) => s + a.creativeIds.length, 0);

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30">
      <td className="py-2.5 pl-4 pr-3">
        <Link href={`/campaigns/${campaign.id}`} className="block">
          <div className="font-medium text-foreground">{campaign.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {campaign.adSets.length} ad set{campaign.adSets.length === 1 ? "" : "s"} · {adsCount} ads ·{" "}
            {campaign.platform === "meta" ? "Meta" : "Google"} · {campaign.budgetStrategy === "cbo" ? "CBO" : "Ad-set budget"}
          </div>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/clients/${client.id}/overview`}
          className="inline-flex items-center gap-1.5 text-xs hover:text-foreground"
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-sm text-[9px] font-semibold text-white"
            style={{ backgroundColor: client.brand.primary }}
          >
            {client.logoInitials}
          </span>
          <span className="truncate">{client.name}</span>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <CampaignStatusBadge status={campaign.status} />
      </td>
      <td className="px-3 py-2.5 text-xs capitalize text-muted-foreground">
        {campaign.objective}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
        {gbp(campaign.dailyBudget)}/day
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{gbp(campaign.spend7d)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.leads7d}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {campaign.leads7d > 0 ? gbp(campaign.cpl, true) : "—"}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
        {campaign.ctr > 0 ? pct(campaign.ctr, 2) : "—"}
      </td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground">
        {relativeTime(campaign.updatedAt)}
      </td>
      <td className="py-2.5 pr-3 pl-1 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/campaigns/${campaign.id}`}>View detail</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>
              {campaign.status === "active" ? "Pause" : "Resume"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  const map: Record<Campaign["status"], string> = {
    active: "bg-success/15 text-success border-success/30",
    paused: "bg-muted text-muted-foreground border-border",
    draft: "bg-warning/20 text-warning-foreground border-warning/40",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium capitalize",
        map[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active"
            ? "bg-success"
            : status === "paused"
              ? "bg-muted-foreground/50"
              : "bg-warning",
        )}
      />
      {status}
    </span>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-3 py-2 font-medium whitespace-nowrap", className)}>
      {children}
    </th>
  );
}
